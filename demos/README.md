# Demo 1: Todo List - WebMCP Imperative API

A simple but comprehensive introduction to WebMCP using the Imperative JavaScript API.

## 🎯 Learning Objectives

By completing this demo, you will learn:

1. **Basic WebMCP Concepts**
   - How to check if WebMCP is available
   - Understanding the `navigator.modelContext` API
   - Tool registration and lifecycle

2. **Tool Definition**
   - Creating tool schemas with `inputSchema`
   - Writing clear descriptions for AI agents
   - Implementing tool execution functions
   - Returning structured responses

3. **Error Handling**
   - Validating tool inputs
   - Returning error messages to agents
   - Handling edge cases gracefully

4. **State Management**
   - Maintaining application state
   - Synchronizing UI with tool execution
   - Logging agent activities

## 📋 Features

### Registered WebMCP Tools

1. **`add_todo`** - Add a new todo item
2. **`mark_complete`** - Mark a todo as complete
3. **`delete_todo`** - Delete a todo item
4. **`list_todos`** - Get all todos with their status

### UI Features

- Manual todo management interface for humans
- Real-time todo list display
- WebMCP availability indicator
- Registered tools display
- AI agent activity log
- Comprehensive usage instructions

## 🚀 Quick Start

### Prerequisites

1. **Chrome 146+** with WebMCP flag enabled
   - Navigate to: `chrome://flags/#enable-webmcp-testing`
   - Set to: **Enabled**
   - Restart Chrome

2. **Model Context Tool Inspector Extension**
   - Install from Chrome EPP documentation
   - Required for testing tools

### Running the Demo

1. Open `index.html` in Chrome 146+
2. Check the "WebMCP Status" card - should show green ✅
3. See 4 registered tools in the "Registered Tools" card
4. Open the Model Context Tool Inspector Extension
5. Start testing!

## 🧪 Testing Scenarios

### Scenario 1: Manual Tool Execution

**Test adding a todo:**

1. Open Model Context Tool Inspector Extension
2. Select tool: `add_todo`
3. Input parameters:
```json
{
  "text": "Buy groceries"
}
```
4. Click "Execute Tool"
5. Observe:
   - New todo appears in the list
   - Activity log shows agent action
   - Success message returned

**Expected Result:**
```
Successfully added todo: "Buy groceries". Todo ID: todo-1234567890. Total todos: 3
```

---

### Scenario 2: List All Todos

**Test listing todos:**

1. Select tool: `list_todos`
2. Input parameters:
```json
{}
```
3. Click "Execute Tool"

**Expected Result:**
```
Todo List (3 total, 0 completed, 3 pending):

1. [ ] Try the Model Context Tool Inspector Extension (ID: todo-...)
2. [ ] Test adding a todo via AI agent (ID: todo-...)
3. [ ] Buy groceries (ID: todo-...)

Structured data:
{
  "total": 3,
  "completed": 0,
  "pending": 3,
  "todos": [...]
}
```

---

### Scenario 3: Mark Todo Complete

**Test marking a todo as complete:**

1. First, run `list_todos` to get a todo ID
2. Copy one of the IDs (e.g., `todo-1708123456789-abc123`)
3. Select tool: `mark_complete`
4. Input parameters:
```json
{
  "id": "todo-1708123456789-abc123"
}
```
5. Click "Execute Tool"

**Expected Result:**
```
Successfully marked todo "Buy groceries" as complete.
```

The todo will have a checkmark and strikethrough in the UI.

---

### Scenario 4: Delete Todo

**Test deleting a todo:**

1. Get a todo ID from `list_todos`
2. Select tool: `delete_todo`
3. Input parameters:
```json
{
  "id": "todo-1708123456789-abc123"
}
```
4. Click "Execute Tool"

**Expected Result:**
```
Successfully deleted todo "Buy groceries". Remaining todos: 2
```

---

### Scenario 5: Natural Language (Gemini Integration)

**Prerequisites:**
- Gemini API key configured in extension
- Extension's "Agent Mode" enabled

**Test with natural language:**

1. In the extension, switch to "Agent Mode"
2. Try these prompts:

**Prompt 1:**
```
Add three todos: finish report, call dentist, and water plants
```

**Expected Behavior:**
- Agent calls `add_todo` three times
- Three new todos appear in the list
- Activity log shows all three actions

**Prompt 2:**
```
Show me all my todos
```

**Expected Behavior:**
- Agent calls `list_todos`
- Returns formatted list with IDs and status

**Prompt 3:**
```
Mark the first todo as complete
```

**Expected Behavior:**
- Agent calls `list_todos` first to get IDs
- Then calls `mark_complete` with the first todo's ID
- First todo gets checked off

**Prompt 4:**
```
Delete all completed todos
```

**Expected Behavior:**
- Agent calls `list_todos` to find completed todos
- Calls `delete_todo` for each completed item
- Completed todos removed from list

---

### Scenario 6: Error Handling

**Test invalid inputs:**

**Test 1: Empty todo text**
```json
{
  "text": ""
}
```

**Expected Result:**
```
Error: Todo text cannot be empty. Please provide a description for the todo item.
```

**Test 2: Invalid todo ID**
```json
{
  "id": "invalid-id-12345"
}
```

**Expected Result:**
```
Error: Todo with ID "invalid-id-12345" not found. Use list_todos to see available todos and their IDs.
```

**Test 3: Mark already completed todo**
```json
{
  "id": "todo-already-completed"
}
```

**Expected Result:**
```
Todo "Some task" is already marked as complete.
```

## 📚 Code Walkthrough

### 1. Tool Registration

```javascript
window.navigator.modelContext.registerTool({
  name: "add_todo",
  description: "Add a new item to the todo list...",
  inputSchema: {
    type: "object",
    properties: {
      text: {
        type: "string",
        description: "The todo item text..."
      }
    },
    required: ["text"]
  },
  execute: ({ text }) => {
    // Tool implementation
    return {
      content: [{
        type: "text",
        text: "Success message"
      }]
    };
  }
});
```

**Key Points:**
- `name`: Unique identifier (use snake_case)
- `description`: Clear explanation of what the tool does
- `inputSchema`: JSON Schema defining parameters
- `execute`: Function that implements the tool logic
- Return object with `content` array

---

### 2. Input Validation

```javascript
execute: ({ text }) => {
  // Always validate inputs
  if (!text || text.trim() === '') {
    return {
      content: [{
        type: "text",
        text: "Error: Todo text cannot be empty..."
      }]
    };
  }

  // Process if valid
  // ...
}
```

**Best Practice:**
- Validate all inputs, even if schema requires them
- Return descriptive error messages
- Help the agent correct mistakes

---

### 3. State Management

```javascript
// Update application state
todos.push(newTodo);

// Update UI to reflect changes
renderTodos();

// Log for debugging
logActivity('Added todo', 'success');

// Return result to agent
return {
  content: [{
    type: "text",
    text: `Successfully added todo: "${newTodo.text}"`
  }]
};
```

**Best Practice:**
- Update state first
- Sync UI with state
- Return after UI updates (important for multi-step workflows)

---

### 4. Response Format

```javascript
// Simple text response
return {
  content: [{
    type: "text",
    text: "Operation completed successfully"
  }]
};

// Structured data response
return {
  content: [{
    type: "text",
    text: JSON.stringify({
      success: true,
      todoId: newTodo.id,
      message: "Todo added"
    }, null, 2)
  }]
};
```

**Best Practice:**
- Always return human-readable text
- Include structured data when useful
- Provide context (IDs, counts, etc.)

## 🎓 Key Concepts Demonstrated

### 1. Tool Discovery
Agents can discover tools through the extension or programmatically.

### 2. Schema Design
Well-designed schemas help agents understand what data to provide.

### 3. Error Messages
Clear error messages enable agents to self-correct and retry.

### 4. Composability
Tools like `list_todos` enable agents to get IDs for other tools.

### 5. State Synchronization
UI must reflect tool executions, not just manual interactions.

## 🐛 Common Issues

### Issue 1: WebMCP Not Available

**Symptom:** Red error message in Status card

**Solutions:**
1. Check Chrome version: `chrome://version` (need 146+)
2. Enable flag: `chrome://flags/#enable-webmcp-testing`
3. Restart Chrome completely
4. Clear cache if needed

---

### Issue 2: Tools Not Showing in Extension

**Symptom:** Extension shows "No tools found"

**Solutions:**
1. Refresh the page
2. Check JavaScript console for errors
3. Verify tool registration code is running
4. Ensure `init()` function completed

---

### Issue 3: Agent Not Finding Todos

**Symptom:** Agent says "todo not found" with valid ID

**Solutions:**
1. Run `list_todos` first to get current IDs
2. Copy ID exactly (they're generated dynamically)
3. Check Activity Log for actual todo IDs

## 🔍 Debugging

### JavaScript Console
```javascript
// View all todos
window.todoDebug.getTodos()

// Clear all todos
window.todoDebug.clearAllTodos()

// Check WebMCP API
window.todoDebug.getWebMCPAPI()
```

### Activity Log
- Green entries: Successful operations
- Red entries: Errors
- Yellow entries: Warnings
- Blue entries: Info messages

## 📈 Next Steps

After mastering this demo:

1. **Experiment:**
   - Add more tool parameters
   - Implement todo priorities
   - Add due dates
   - Create categories

2. **Move to Demo 2:**
   - More complex schemas
   - Async operations
   - Advanced error handling

3. **Read Documentation:**
   - Review PROJECT-PLAN.md
   - Study best practices
   - Learn about Declarative API

## 💡 Tips for Building Your Own Tools

1. **Start Simple:** Begin with one tool and test thoroughly
2. **Validate Everything:** Never trust input data
3. **Clear Descriptions:** Help agents understand when to use tools
4. **Return Context:** Include IDs, counts, and relevant info
5. **Test Edge Cases:** Empty inputs, invalid IDs, etc.
6. **Log Activities:** Help with debugging and monitoring
7. **Update UI:** Ensure visual consistency

## 📝 Files in This Demo

- `index.html` - UI structure and layout
- `script.js` - WebMCP tool registration and logic
- `styles.css` - Visual styling and animations
- `README.md` - This documentation

## 🤝 Contributing

Found an issue or have a suggestion? Feel free to modify and improve!

## 📄 License

MIT

---

**Happy Testing! 🎉**
