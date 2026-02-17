# WebMCP Local AI Agent - Complete Setup Guide

## ✅ Pre-Setup Checklist

Before starting, verify you have:

- [ ] macOS (you mentioned you're on Mac)
- [ ] Ollama installed
- [ ] Chrome browser
- [ ] Todo demo still running (http://localhost:8080)

## 🚀 Step-by-Step Setup

### Step 1: Verify Ollama Models

```bash
# Check if Ollama is running
ollama list

# You should see:
# qwen2.5:7b
```

**If model is missing:**
```bash
ollama pull qwen2.5:7b
```

**Verify Ollama API:**
```bash
curl http://localhost:11434/api/tags
# Should return JSON with list of models
```

---

### Step 2: Verify Todo Demo

```bash
# Check if still running
curl http://localhost:8080

# If not running, start it:
cd demos
python3 -m http.server 8080 &
```

Open http://localhost:8080 in browser - should see the todo app.

---

### Step 3: Load Chrome Extension

#### A. Open Extensions Page

1. Open Chrome
2. Navigate to: `chrome://extensions/`
3. Enable "Developer mode" toggle (top-right corner)

#### B. Load Extension

1. Click "Load unpacked" button
2. Navigate to and select:
   ```
   /Users/jageen.shukla/Documents/Projects/Personal/Blogs/webmcp-implementation/extension-demo
   ```
3. Click "Select"

#### C. Verify Extension Loaded

You should see:
- Extension card with name "WebMCP Local AI Agent"
- Version 1.0.0
- No errors

**If you see errors:**
- Check that all files exist
- Look at specific error message
- Try reloading extension

---

### Step 4: Test Extension Popup

1. Click the extension icon in Chrome toolbar (puzzle piece icon if not pinned)
2. Find "WebMCP Local AI Agent"
3. Click it

**You should see:**
- Popup window
- "✅ Ollama connected - All models ready"

**If you see errors:**
- Red status = Ollama not accessible
- Check Ollama is running: `ollama list`
- Verify port 11434 is accessible

---

### Step 5: Navigate to Todo Demo

1. Go to: http://localhost:8080
2. Wait 2-3 seconds for extension to initialize

**You should see:**
- Todo app loads normally
- In browser console (F12): "🤖 WebMCP Agent: Content script loaded"
- After a moment: A floating chat iframe appears in bottom-right corner

**If iframe doesn't appear:**
- Check browser console for errors
- Verify extension is enabled
- Try refreshing page

---

### Step 6: Verify Tool Discovery

#### In Browser Console:

```javascript
// Type this:
window.getWebMCPManifest()

// Should return:
{
  version: "1.0",
  tools: [
    {name: "add_todo", description: "...", inputSchema: {...}},
    {name: "mark_complete", ...},
    {name: "delete_todo", ...},
    {name: "list_todos", ...}
  ]
}
```

#### In Iframe:

The iframe should show:
- Status: "Connected" (green)
- "4 tools available"
- System message: "✅ Found 4 WebMCP tools on this page"
- System message: "Available tools: add_todo, mark_complete, delete_todo, list_todos"

---

### Step 7: Test Chat Interface

In the iframe input field, try:

**Test 1: Simple conversation**
```
You: Hello
```

**Expected:**
- "Thinking..." indicator shows
- Agent responds using qwen2.5:7b
- Response appears in chat

**Test 2: Tool calling**
```
You: Add a todo to buy groceries
```

**Expected:**
- "Analyzing your request..." shows
- "Deciding which tool to use..." shows
- "Executing tools..." shows
- Yellow tool call message: "🔧 Calling add_todo({...})"
- Agent response: "✅ Successfully added todo: 'buy groceries'"
- **In the main page:** New todo appears in the list!

---

## 🧪 Complete Test Scenarios

### Test 1: Single Tool Call
```
You: Add a todo to call mom
```

**Expected Flow:**
1. Agent thinks
2. Detects tool calling needed
3. Uses qwen2.5:7b to decide
4. Shows: `🔧 Calling add_todo({"text":"call mom"})`
5. Todo appears on page
6. Agent confirms: "✅ Successfully added..."

---

### Test 2: List Todos
```
You: Show me my todos
```

**Expected:**
1. Agent uses qwen2.5:7b
2. Calls `list_todos({})`
3. Returns formatted list with all todos

---

### Test 3: Multiple Operations
```
You: Add three todos: buy milk, finish report, water plants
```

**Expected:**
1. qwen2.5:7b identifies need for 3 tool calls
2. Shows 3 separate tool executions
3. All 3 todos appear on page
4. Agent summarizes

---

### Test 4: Conversational (No Tools)
```
You: What can you help me with?
```

**Expected:**
1. No tool calling detected
2. qwen2.5 responds conversationally
3. Explains available capabilities

---

### Test 5: Complex Multi-Step
```
You: Add "test task", then mark it complete, then delete it
```

**Expected:**
1. qwen2.5:7b plans 3 sequential tool calls
2. Executes: add_todo → mark_complete → delete_todo
3. Task appears, gets checked, disappears
4. Agent explains what it did

---

## 🐛 Troubleshooting

### Issue: Iframe Not Appearing

**Check:**
```javascript
// In console
document.getElementById('webmcp-agent-iframe')
// Should return the iframe element
```

**Fix:**
1. Refresh page
2. Check console for errors
3. Verify extension is enabled
4. Try: `chrome://extensions/` → Click refresh on extension

---

### Issue: "Cannot connect to Ollama"

**Check:**
```bash
# Is Ollama running?
ps aux | grep ollama

# Can you reach API?
curl http://localhost:11434/api/tags
```

**Fix:**
```bash
# Start Ollama if needed
ollama serve &

# Verify models
ollama list
```

---

### Issue: Tool Calling Not Working

**Check browser console for:**
- "qwen2.5:7b response:" log
- Parse errors
- Tool execution errors

**Common causes:**
1. qwen2.5:7b not responding correctly → Check Ollama
2. JSON parsing failed → qwen2.5:7b response format issue
3. Tool not found → Tool name mismatch

**Debug:**
```javascript
// In iframe console
availableTools
// Should show array of 4 tools
```

---

### Issue: Extension Errors

**Check `chrome://extensions/`:**
- Look for red "Errors" button
- Click to see detailed error messages

**Common errors:**
1. "Cannot read property..." → File missing or path wrong
2. "Fetch error" → CORS or network issue
3. "Permission denied" → Check manifest.json permissions

---

### Issue: Tools Executing But Not Showing

**Check:**
1. Open main page console (not iframe)
2. Look for activity log messages
3. Verify `window.renderTodos()` is called

**Refresh todo list manually:**
```javascript
// In main page console
window.renderTodos()
```

---

## 📊 Debugging

### Enable Verbose Logging

**In content.js:**
Add `console.log` statements to track flow

**In iframe-agent.js:**
Check these logs:
- "Functiongemma response:"
- "Tool calling decision:"
- "Executing tool:"

**In browser DevTools:**
1. Right-click iframe
2. Select "Inspect" (opens iframe's console)
3. See iframe-specific logs

---

### Test Ollama Directly

```bash
# Test qwen2.5:7b
curl http://localhost:11434/api/generate -d '{
  "model": "qwen2.5:7b",
  "prompt": "Hello, how are you?",
  "stream": false
}'
```

---

### Monitor Network Requests

1. Open DevTools → Network tab
2. Filter: "localhost:11434"
3. Try a chat message
4. See requests to Ollama API
5. Check request/response bodies

---

## ✅ Success Checklist

After setup, you should have:

- [ ] Extension loaded in Chrome
- [ ] Ollama showing as connected in popup
- [ ] Todo demo page open
- [ ] Iframe visible in bottom-right
- [ ] Status shows "Connected" and "4 tools available"
- [ ] Can send chat messages
- [ ] Tool calls execute and update UI
- [ ] Conversational responses work

---

## 🎯 Next Steps

Once everything works:

### 1. Try Different Prompts
- "Delete all completed todos"
- "Show me my pending tasks"
- "Add five todos for today"

### 2. Test Edge Cases
- Invalid tool parameters
- Non-existent todo IDs
- Mixed conversation and tool calling

### 3. Improve Prompts
Edit `iframe-agent.js` to improve:
- Tool calling detection
- qwen2.5:7b prompts and system instructions

### 4. Extend Functionality
- Add new tools to todo app
- Extension automatically discovers them
- Test with new tools

---

## 📚 Understanding the Flow

```
User types message
    ↓
iframe-agent.js receives
    ↓
Detect if needs tools (heuristics + context)
    ↓
    ├─ YES: Tool calling path
    │   ↓
    │   Call qwen2.5:7b with tools
    │   ↓
    │   Parse tool call decision
    │   ↓
    │   Send to content.js
    │   ↓
    │   Execute on page
    │   ↓
    │   Return result
    │   ↓
    │   Show in chat
    │
    └─ NO: Conversation path
        ↓
        Call qwen2.5:7b with context
        ↓
        Show response in chat
```

---

**Ready to test!** Follow steps 1-7 and let me know what you see! 🚀
