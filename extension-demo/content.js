/**
 * WebMCP Content Script
 *
 * This script runs on every webpage and:
 * 1. Detects WebMCP tools using the official discovery API
 * 2. Communicates with side panel and background script
 * 3. Executes tools using the official execution API
 *
 * 100% Official WebMCP Implementation - No workarounds!
 */

console.log('🤖 WebMCP Agent: Content script loaded');

// Store discovered tools
let discoveredTools = [];

// Discover WebMCP tools on page load
(function init() {
  // Wait for page to be fully loaded
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
    return;
  }

  // Delay to allow page scripts to initialize
  setTimeout(() => {
    discoverWebMCPTools();
  }, 1000);
})();

// Discover tools from page using official API
function discoverWebMCPTools() {
  console.log('🔍 Discovering WebMCP tools...');

  try {
    // Check if WebMCP API is available
    if (!window.navigator.modelContextTesting) {
      console.error('❌ navigator.modelContextTesting NOT available');
      console.log('💡 Enable: chrome://flags/#enable-webmcp-testing');
      return;
    }

    console.log('✅ navigator.modelContextTesting is available!');

    // Use official API to list tools
    const tools = window.navigator.modelContextTesting.listTools();
    console.log(`✅ Discovered ${tools.length} tools using OFFICIAL API`);
    console.log('📋 Tools:', tools);

    // Store tools
    discoveredTools = tools;

    // Send to background script
    chrome.runtime.sendMessage({
      type: 'TOOLS_DISCOVERED',
      data: {
        available: true,
        tools: tools
      }
    });

    // Monitor for tool changes using official callback
    window.navigator.modelContextTesting.registerToolsChangedCallback(() => {
      console.log('🔄 Tools changed, re-discovering...');
      discoverWebMCPTools();
    });

  } catch (error) {
    console.error('❌ Error discovering tools:', error);
  }
}

// Listen for messages from side panel
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  const { type, data } = message;

  switch (type) {
    case 'REQUEST_TOOLS':
      // Send cached tools or empty array
      sendResponse({
        type: 'TOOLS_DISCOVERED',
        data: {
          available: discoveredTools.length > 0,
          tools: discoveredTools
        }
      });
      break;

    case 'EXECUTE_TOOL':
      // Execute tool using official API
      executeTool(data.toolName, data.parameters)
        .then(result => {
          sendResponse({ success: true, result });
        })
        .catch(error => {
          sendResponse({ success: false, error: error.message });
        });
      return true; // Keep channel open for async response
  }
});

// Execute tool using official WebMCP API
async function executeTool(toolName, parameters) {
  console.log(`🔧 Executing tool: ${toolName}`, parameters);

  try {
    // IMPORTANT: executeTool expects a JSON STRING, not an object!
    // This matches Google's official Model Context Tool Inspector implementation
    const args = parameters || {};
    const inputArgsString = JSON.stringify(args);

    console.log(`📤 Calling executeTool("${toolName}", "${inputArgsString}")`);

    // Use official WebMCP API to execute the tool
    const result = await window.navigator.modelContextTesting.executeTool(
      toolName,
      inputArgsString  // Pass JSON string, not object!
    );

    console.log(`✅ Tool executed successfully:`, result);
    return result;

  } catch (error) {
    console.error(`❌ Tool execution failed:`, error);
    console.error(`❌ Tool name: ${toolName}`);
    console.error(`❌ Arguments:`, parameters);
    throw error;
  }
}
