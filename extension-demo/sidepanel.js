/**
 * WebMCP Side Panel Agent
 *
 * This runs in the Chrome Side Panel and:
 * - Monitors the active tab
 * - Discovers WebMCP tools on the current page
 * - Provides chat interface for AI agent
 * - Executes tools via content script
 */

const OLLAMA_URL = 'http://localhost:11434';
const MODEL = 'qwen2.5:7b'; // Single model for everything

// State
let currentTabId = null;
let availableTools = [];
let conversationHistory = [];

// DOM Elements
const chatContainer = document.getElementById('chat-container');
const userInput = document.getElementById('user-input');
const sendBtn = document.getElementById('send-btn');
const thinking = document.getElementById('thinking');
const thinkingText = document.getElementById('thinking-text');
const ollamaStatus = document.getElementById('ollama-status');
const toolsInfo = document.getElementById('tools-info');
const toolsList = document.getElementById('tools-list');
const toolsHeader = document.getElementById('tools-header');
const toolsCount = document.getElementById('tools-count');
const toolsToggle = document.getElementById('tools-toggle');
const tabTitle = document.getElementById('tab-title');
const tabUrl = document.getElementById('tab-url');

// Initialize
async function init() {
  console.log('🚀 Side panel initialized');

  // Check Ollama status
  await updateOllamaStatus();

  // Get current active tab
  await updateActiveTab();

  // Setup event listeners
  sendBtn.addEventListener('click', handleSend);
  userInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  });

  // Tools list toggle
  toolsHeader.addEventListener('click', () => {
    toolsList.classList.toggle('expanded');
    const isExpanded = toolsList.classList.contains('expanded');
    toolsToggle.textContent = isExpanded ? '▲ Click to collapse' : '▼ Click to expand';
  });

  // Listen for tab changes
  chrome.tabs.onActivated.addListener(async (activeInfo) => {
    console.log('📍 Tab activated:', activeInfo.tabId);
    await updateActiveTab();
  });

  // Listen for tab updates (URL changes)
  chrome.tabs.onUpdated.addListener(async (tabId, changeInfo, tab) => {
    if (tabId === currentTabId && changeInfo.url) {
      console.log('🔄 Tab URL changed:', changeInfo.url);
      await updateActiveTab();
    }
  });

  // Listen for messages from content script
  chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    console.log('📬 Side panel received message:', message.type, 'from tab:', sender?.tab?.id);

    if (message.type === 'TOOLS_DISCOVERED') {
      console.log('📦 Tools discovered:', message.data?.tools?.length || 0, 'tools');
      console.log('📍 Current tab ID:', currentTabId);
      console.log('📍 Message from tab:', sender?.tab?.id);

      if (sender?.tab?.id === currentTabId) {
        console.log('✅ Tab IDs match, processing tools');
        handleToolsDiscovered(message.data);
      } else {
        console.log('⚠️ Tab IDs do not match, ignoring');
      }
    }
  });
}

// Update Ollama status
async function updateOllamaStatus() {
  try {
    const response = await fetch(`${OLLAMA_URL}/api/tags`);
    if (response.ok) {
      ollamaStatus.textContent = '✓ Connected';
      ollamaStatus.className = 'status connected';
    } else {
      throw new Error('API error');
    }
  } catch (error) {
    ollamaStatus.textContent = '✗ Disconnected';
    ollamaStatus.className = 'status disconnected';
    console.error('Ollama connection error:', error);
  }
}

// Update active tab info
async function updateActiveTab() {
  try {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

    if (!tab) {
      console.warn('No active tab found');
      return;
    }

    currentTabId = tab.id;
    tabTitle.textContent = tab.title || 'Untitled';
    tabUrl.textContent = tab.url || '';

    console.log('🔍 Active tab updated:', currentTabId, tab.url);

    // Request tools from content script
    await requestToolsFromTab(tab.id);

  } catch (error) {
    console.error('Error updating active tab:', error);
    tabTitle.textContent = 'Error loading tab';
    tabUrl.textContent = '';
  }
}

// Request tools from content script
async function requestToolsFromTab(tabId) {
  try {
    // Send message to content script to discover tools
    await chrome.tabs.sendMessage(tabId, { type: 'REQUEST_TOOLS' });
    console.log('📤 Requested tools from tab:', tabId);
  } catch (error) {
    console.warn('Could not request tools from tab:', error.message);
    // Tab might not have content script injected yet
    availableTools = [];
    updateToolsDisplay();
  }
}

// Handle discovered tools
function handleToolsDiscovered(data) {
  availableTools = data.tools || [];

  console.log(`✅ Received ${availableTools.length} tools`);
  console.log('📋 Tools array:', availableTools);
  console.log('🔍 Sample tool:', availableTools[0]);

  if (availableTools.length > 0) {
    // Remove empty state
    const emptyState = chatContainer.querySelector('.empty-state');
    if (emptyState) {
      emptyState.remove();
    }

    addMessage('system', `✅ Found ${availableTools.length} WebMCP tools on this page`);
  }

  updateToolsDisplay();

  console.log('✅ handleToolsDiscovered completed, availableTools.length =', availableTools.length);
}

// Update tools display
function updateToolsDisplay() {
  if (availableTools.length > 0) {
    toolsInfo.classList.add('visible');

    // Update count in header
    toolsCount.textContent = `${availableTools.length} tool${availableTools.length === 1 ? '' : 's'}`;

    // Update tools list (just names, no descriptions)
    toolsList.innerHTML = availableTools.map(tool =>
      `<div class="tool-item">📌 ${tool.name}</div>`
    ).join('');
  } else {
    toolsInfo.classList.remove('visible');
    toolsCount.textContent = '0 tools';
    toolsList.innerHTML = '<div>No tools discovered yet...</div>';
  }
}

// Handle user input
async function handleSend() {
  const userMessage = userInput.value.trim();
  if (!userMessage) return;

  // Clear input
  userInput.value = '';

  // Add user message to chat
  addMessage('user', userMessage);

  // Add to history
  conversationHistory.push({
    role: 'user',
    content: userMessage
  });

  // Disable input
  setInputEnabled(false);
  showThinking('Analyzing your request...');

  try {
    // Check if Ollama is connected
    const ollamaConnected = ollamaStatus.classList.contains('connected');
    if (!ollamaConnected) {
      throw new Error('Ollama is not connected. Please start Ollama server.');
    }

    console.log('📨 Processing message:', userMessage);
    console.log('🔧 Available tools count:', availableTools.length);

    // Check if this needs tool calling
    const needsTools = await detectToolIntent(userMessage);
    console.log('🤔 Needs tools?', needsTools);

    if (needsTools && availableTools.length > 0) {
      console.log('➡️ Attempting tool execution');
      await handleWithLLM(userMessage, true);
    } else {
      console.log('➡️ Conversational response');
      await handleWithLLM(userMessage, false);
    }
  } catch (error) {
    console.error('Error:', error);
    addMessage('agent', `❌ Error: ${error.message}`);
  } finally {
    setInputEnabled(true);
    hideThinking();
  }
}

// Detect if message needs tool calling
async function detectToolIntent(message) {
  // If no tools available, don't try tool calling
  if (availableTools.length === 0) {
    return false;
  }

  const lowerMessage = message.toLowerCase();

  // Quick heuristics - action words
  const actionWords = ['add', 'create', 'list', 'show', 'delete', 'remove', 'mark', 'complete', 'get'];
  const hasActionWord = actionWords.some(word => lowerMessage.includes(word));

  // Domain-specific keywords
  const domainWords = ['todo', 'task', 'item', 'entry'];
  const hasDomainWord = domainWords.some(word => lowerMessage.includes(word));

  // If has both action and domain word, likely needs tool
  if (hasActionWord && hasDomainWord) {
    console.log('✅ Tool intent detected: action + domain word');
    return true;
  }

  // Check if any tool names match directly
  const mentionsToolName = availableTools.some(tool => {
    const toolNameReadable = tool.name.replace(/_/g, ' ');
    return lowerMessage.includes(toolNameReadable);
  });

  if (mentionsToolName) {
    console.log('✅ Tool intent detected: tool name mentioned');
    return true;
  }

  // If has action word and tools are available, try tool calling
  if (hasActionWord && availableTools.length > 0) {
    console.log('✅ Tool intent detected: action word + tools available');
    return true;
  }

  console.log('❌ No tool intent detected');
  return false;
}

// Unified LLM handler - handles both tool calling and conversation
async function handleWithLLM(userMessage, attemptToolCall) {
  showThinking(attemptToolCall ? 'Analyzing request...' : 'Thinking...');

  let prompt;

  if (attemptToolCall && availableTools.length > 0) {
    // Try to extract tool call
    prompt = buildToolCallingPrompt(userMessage);
  } else {
    // Conversational response
    prompt = buildConversationPrompt(userMessage);
  }

  try {
    const response = await callOllama(MODEL, prompt);
    console.log('📥 LLM response:', response.response);

    // If we attempted tool calling, try to parse JSON
    if (attemptToolCall && availableTools.length > 0) {
      const toolCalls = tryParseToolCalls(response.response);

      if (toolCalls && toolCalls.length > 0) {
        // Execute all tools sequentially
        console.log(`🔧 Executing ${toolCalls.length} tool(s)...`);

        for (let i = 0; i < toolCalls.length; i++) {
          const toolCall = toolCalls[i];
          showThinking(`Executing tool ${i + 1} of ${toolCalls.length}...`);
          await executeToolCall(toolCall);
        }
        return;
      } else {
        console.log('ℹ️ No valid tool calls found, treating as conversation');
      }
    }

    // Handle as conversation
    const agentResponse = response.response.trim();
    conversationHistory.push({
      role: 'assistant',
      content: agentResponse
    });
    addMessage('agent', agentResponse);

  } catch (error) {
    console.error('❌ LLM error:', error);
    addMessage('agent', `❌ Error: ${error.message}`);
  }
}

// Build prompt for tool calling
function buildToolCallingPrompt(userMessage) {
  const toolDefs = availableTools.map(t =>
    `- ${t.name}: ${t.description}`
  ).join('\n');

  return `You are a tool calling assistant. The user wants to manage their todos.

Available tools:
${toolDefs}

User said: "${userMessage}"

Respond with ONLY JSON format, nothing else. For multiple operations, return multiple JSON objects on separate lines.

Examples:
User: "add buy milk" -> {"tool": "add_todo", "parameters": {"text": "buy milk"}}
User: "list my todos" -> {"tool": "list_todos", "parameters": {}}
User: "add task1 and task2" ->
{"tool": "add_todo", "parameters": {"text": "task1"}}
{"tool": "add_todo", "parameters": {"text": "task2"}}

Your JSON response:`;
}

// Build prompt for conversation
function buildConversationPrompt(userMessage) {
  const context = conversationHistory
    .slice(-5)
    .map(msg => `${msg.role}: ${msg.content}`)
    .join('\n');

  return `You are a helpful AI assistant integrated into a web browser.

${context}

User: ${userMessage}

Respond naturally and helpfully.`;
}

// Try to parse tool calls from LLM response (supports multiple tool calls)
function tryParseToolCalls(response) {
  try {
    const cleanResponse = response.trim();

    // Extract ALL JSON objects with nested braces support
    const jsonMatches = cleanResponse.matchAll(/\{(?:[^{}]|\{[^{}]*\})*\}/g);
    const toolCalls = [];

    for (const match of jsonMatches) {
      try {
        const jsonStr = match[0];
        console.log('📄 Extracted JSON:', jsonStr);

        // Clean non-printable characters
        const cleanedJson = jsonStr.replace(/[\u0000-\u001F\u007F-\u009F]/g, '');

        const toolCall = JSON.parse(cleanedJson);

        // Verify it has the expected structure
        if (toolCall.tool && typeof toolCall.tool === 'string') {
          toolCalls.push(toolCall);
          console.log('✅ Parsed tool call:', toolCall);
        }
      } catch (error) {
        console.warn('⚠️ Failed to parse one JSON object:', error.message);
      }
    }

    if (toolCalls.length === 0) {
      console.log('⚠️ No valid tool calls found in response');
      return null;
    }

    console.log(`✅ Found ${toolCalls.length} tool call(s)`);
    return toolCalls;
  } catch (error) {
    console.warn('⚠️ Failed to parse tool calls:', error.message);
    return null;
  }
}

// Execute a tool call
async function executeToolCall(toolCall) {
  showThinking('Executing tool...');
  console.log('🚀 Executing:', toolCall.tool, 'with params:', toolCall.parameters);

  addMessage('tool', `🔧 Calling ${toolCall.tool}(${JSON.stringify(toolCall.parameters || {})})`);

  try {
    // Execute via content script which uses official navigator.modelContextTesting.executeTool()
    const result = await executeToolInTab(toolCall.tool, toolCall.parameters || {});
    console.log('📦 Tool result:', result);
    console.log('📦 Result structure:', JSON.stringify(result, null, 2));

    if (result.success) {
      // Official WebMCP execute returns: { content: [{type: "text", text: "..."}] }
      // BUT it's returned as a JSON STRING, so we need to parse it first
      let parsedResult;
      try {
        parsedResult = typeof result.result === 'string'
          ? JSON.parse(result.result)
          : result.result;
      } catch (parseError) {
        console.error('❌ Failed to parse result:', parseError);
        addMessage('agent', `❌ Failed to parse result: ${result.result}`);
        return;
      }

      // Check if parsed result has the expected structure
      if (!parsedResult || !parsedResult.content || !Array.isArray(parsedResult.content)) {
        console.error('❌ Unexpected result structure:', parsedResult);
        addMessage('agent', `❌ Unexpected result structure: ${JSON.stringify(parsedResult)}`);
        return;
      }

      const resultText = parsedResult.content[0].text;
      addMessage('agent', `✅ ${resultText}`);

      conversationHistory.push({
        role: 'assistant',
        content: resultText
      });
    } else {
      addMessage('agent', `❌ Tool execution failed: ${result.error}`);
    }
  } catch (error) {
    console.error('❌ Tool execution error:', error);
    addMessage('agent', `❌ Error: ${error.message}`);
  }
}

// Execute tool in active tab via content script
// Content script uses official WebMCP API: navigator.modelContextTesting.executeTool()
async function executeToolInTab(toolName, parameters) {
  try {
    const response = await chrome.tabs.sendMessage(currentTabId, {
      type: 'EXECUTE_TOOL',
      data: { toolName, parameters }
    });

    return response;
  } catch (error) {
    console.error('Error executing tool in tab:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

// Call Ollama API
async function callOllama(model, prompt) {
  console.log(`🤖 Calling Ollama (${model})...`);

  const response = await fetch(`${OLLAMA_URL}/api/generate`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: model,
      prompt: prompt,
      stream: false
    }),
  });

  if (!response.ok) {
    throw new Error(`Ollama API error: ${response.statusText}`);
  }

  return await response.json();
}

// UI Helpers
function addMessage(type, text) {
  const message = document.createElement('div');
  message.className = `message ${type}`;
  message.textContent = text;

  chatContainer.appendChild(message);
  chatContainer.scrollTop = chatContainer.scrollHeight;
}

function showThinking(text) {
  thinkingText.textContent = text;
  thinking.classList.add('active');
}

function hideThinking() {
  thinking.classList.remove('active');
}

function setInputEnabled(enabled) {
  userInput.disabled = !enabled;
  sendBtn.disabled = !enabled;
}

// Start
init();
