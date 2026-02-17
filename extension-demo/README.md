# WebMCP Local AI Agent - Chrome Extension

A Chrome extension that demonstrates WebMCP with **local Ollama LLMs** - no Google API keys needed!

## 🎯 What This Is

This is the **correct implementation** of WebMCP as intended:
- ✅ Runs in browser context (Chrome extension)
- ✅ Uses local LLM (qwen2.5:7b)
- ✅ Proper tool discovery via `window.getWebMCPManifest()`
- ✅ Iframe UI for agent interaction
- ✅ No external dependencies

## 🤖 Architecture

```
┌─────────────────────────────────────────────────────────┐
│ Chrome Extension (Runs in Browser)                      │
├─────────────────────────────────────────────────────────┤
│                                                          │
│  Content Script (content.js)                            │
│    ├─ Discovers WebMCP tools                            │
│    ├─ Injects iframe UI                                 │
│    └─ Executes tools on page                            │
│                                                          │
│  Iframe Agent (iframe-agent.js)                         │
│    ├─ Chat interface                                    │
│    ├─ Calls Ollama LLM (qwen2.5:7b)                     │
│    │   └─ Handles both tool calling and conversation    │
│    └─ Sends tool requests to content script             │
│                                                          │
└─────────────────────────────────────────────────────────┘
                        ↓
                  Ollama (Local)
                  Port 11434
                        ↓
                   qwen2.5:7b
            (Tool calling + Conversation)
```

## 📋 Requirements

### 1. Ollama Installed
```bash
# Check if Ollama is running
curl http://localhost:11434/api/tags

# Should return list of models
```

### 2. Required Model
```bash
# Pull model if not already installed
ollama pull qwen2.5:7b
```

### 3. Chrome Browser
- Any recent version
- Developer mode enabled

## 🚀 Installation

### Step 1: Load Extension

1. Open Chrome and go to: `chrome://extensions/`
2. Enable "Developer mode" (toggle in top-right)
3. Click "Load unpacked"
4. Select the `extension-demo` folder
5. Extension should appear in your extensions list

### Step 2: Verify Ollama

1. Make sure Ollama is running:
```bash
ollama list
# Should show qwen2.5:7b
```

2. Verify Ollama is accessible:
```bash
curl http://localhost:11434/api/tags
```

### Step 3: Test on Todo Demo

1. Navigate to: http://localhost:8080 (our todo demo)
2. Look for the agent iframe in bottom-right corner
3. Should show "Connected" status and "4 tools available"

## 🎮 Usage

### Example Interactions

**Tool Calling:**
```
You: Add a todo to buy groceries

Agent:
  🔧 Calling add_todo({"text":"buy groceries"})
  ✅ Successfully added todo: "buy groceries"
```

**Conversation:**
```
You: What can you help me with?

Agent: I can help you manage your todos on this page.
       I can add, list, complete, or delete todo items.
       Just tell me what you'd like to do!
```

**Multi-step:**
```
You: Add three todos: buy milk, call mom, finish report

Agent:
  🔧 Calling add_todo({"text":"buy milk"})
  ✅ Successfully added
  🔧 Calling add_todo({"text":"call mom"})
  ✅ Successfully added
  🔧 Calling add_todo({"text":"finish report"})
  ✅ Successfully added

  I've added all three todos for you!
```

## 🔧 How It Works

### 1. Tool Discovery

```javascript
// content.js discovers tools
function discoverWebMCPTools() {
  // Best practice: Check for discovery function
  if (window.getWebMCPManifest) {
    return window.getWebMCPManifest();
  }

  // Fallback: Check if WebMCP API exists
  if (window.navigator.modelContext) {
    return { available: true, tools: [] };
  }

  return { available: false };
}
```

### 2. Tool Calling Decision

```javascript
// iframe-agent.js uses qwen2.5:7b
const prompt = `Available tools: ${JSON.stringify(tools)}

User request: "${userMessage}"

Decide which tool to call with what parameters.`;

const decision = await callOllama('qwen2.5:7b', prompt);
// → { needs_tool: true, tool_calls: [...] }
```

### 3. Tool Execution

```javascript
// content.js executes on page
function executeTool(toolName, parameters) {
  // Direct execution in page context
  switch (toolName) {
    case 'add_todo':
      window.todos.push({...});
      window.renderTodos();
      break;
    // ... other tools
  }
}
```

### 4. Conversational Fallback

```javascript
// iframe-agent.js uses qwen2.5
if (!needsToolCalling) {
  const response = await callOllama('qwen2.5:7b', conversationPrompt);
  addMessage('agent', response);
}
```

## 📊 Why This Is Better

### vs Our Previous Puppeteer Demo:

| Aspect | Puppeteer Demo | This Extension |
|--------|----------------|----------------|
| **Architecture** | External Node.js agent | In-browser extension |
| **Tool Discovery** | Hardcoded | Proper `getWebMCPManifest()` |
| **Context** | Outside browser | Inside browser |
| **Intent** | Educational | Production-ready pattern |
| **Complexity** | High (browser automation) | Lower (native APIs) |

### vs Cloud LLMs (Gemini/GPT):

| Aspect | Cloud LLMs | Local LLMs |
|--------|-----------|------------|
| **Privacy** | Data sent to cloud | Everything local |
| **Cost** | API costs | Free (after hardware) |
| **Latency** | Network dependent | Local (faster) |
| **Availability** | Needs internet | Works offline |
| **Setup** | API keys needed | Ollama install |

## 🐛 Troubleshooting

### Extension not loading
1. Check Chrome extensions page for errors
2. Try reloading the extension
3. Check browser console for errors

### Ollama not connecting
```bash
# Check if Ollama is running
ps aux | grep ollama

# Start Ollama if needed
ollama serve

# Verify API is accessible
curl http://localhost:11434/api/tags
```

### Model not found
```bash
# List installed models
ollama list

# Pull missing model
ollama pull qwen2.5:7b
```

### Iframe not appearing
1. Check if page has WebMCP tools
2. Open browser console and look for "WebMCP Agent" logs
3. Verify content script is loading

### Tool calling not working
1. Check if tools are discovered (see iframe UI)
2. Look at console for function calling logs
3. Verify tool names match exactly

## 🔬 Testing

### Test Tool Discovery
1. Navigate to http://localhost:8080
2. Open browser console (F12)
3. Type: `window.getWebMCPManifest()`
4. Should see 4 tools

### Test Ollama Connection
```bash
# Test qwen2.5:7b
curl http://localhost:11434/api/generate -d '{
  "model": "qwen2.5:7b",
  "prompt": "Hello",
  "stream": false
}'
```

### Test Extension
1. Navigate to todo demo
2. See iframe appear
3. Status should be "Connected"
4. Try: "Add a todo to test the extension"

## 📚 Files Structure

```
extension-demo/
├── manifest.json          # Extension configuration
├── content.js            # Runs on web pages, discovers tools
├── background.js         # Service worker (minimal)
├── iframe-agent.html     # Agent chat UI
├── iframe-agent.js       # Agent logic with Ollama
├── icon16.png           # Extension icon (16x16)
├── icon48.png           # Extension icon (48x48)
├── icon128.png          # Extension icon (128x128)
└── README.md            # This file
```

## 🎯 Key Differences from Puppeteer Demo

### What Changed:

1. **Architecture**
   - Was: External Node.js agent with Puppeteer
   - Now: In-browser Chrome extension

2. **LLM Integration**
   - Was: Google Gemini (cloud)
   - Now: Ollama local models

3. **Tool Discovery**
   - Was: Hardcoded tool definitions
   - Now: Proper `window.getWebMCPManifest()`

4. **UI**
   - Was: Terminal chat interface
   - Now: Iframe chat in browser

5. **Execution Context**
   - Was: Outside browser, automated
   - Now: Inside browser, native

## 🚀 Next Steps

### Test with Different Pages
Try the extension on other websites with WebMCP tools (when available)

### Improve Tool Calling
- Better prompts for qwen2.5:7b
- Add function calling examples
- Handle complex multi-step workflows

### Enhance UI
- Add tool execution visualization
- Show tool parameters before execution
- Add confirmation for destructive actions

### Add More Models
```bash
# Try other models
ollama pull qwen2.5-coder:14b  # For code-related tasks
ollama pull deepseek-coder-v2  # Alternative
```

## 💡 Understanding WebMCP

This extension demonstrates **exactly** how WebMCP is meant to work:

1. **Website** exposes tools via `navigator.modelContext.registerTool()`
2. **Website** also exposes discovery via `window.getWebMCPManifest()`
3. **Extension** runs in browser context
4. **Extension** discovers tools using discovery function
5. **Extension** uses local LLM to understand user intent
6. **Extension** executes tools directly on page
7. **User** sees everything happen in browser

No external orchestration, no cloud APIs, no browser automation - just clean, standards-based tool integration.

---

**This is WebMCP as intended!** 🎉
