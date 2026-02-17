// ============================================
// Todo List - WebMCP Implementation
// ============================================

// ============================================
// 1. DATA STORAGE
// ============================================

// In-memory storage for todos
// Exposed on window for extension access
window.todos = [];

// ============================================
// 2. UTILITY FUNCTIONS
// ============================================

/**
 * Generate a unique ID for todos
 */
function generateId() {
  return 'todo-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9);
}

/**
 * Log AI agent activity
 */
function logActivity(message, type = 'info') {
  const activityContent = document.getElementById('activity-content');
  const timestamp = new Date().toLocaleTimeString();

  // Remove empty state if exists
  const emptyState = activityContent.querySelector('.empty-state');
  if (emptyState) {
    emptyState.remove();
  }

  const logEntry = document.createElement('div');
  logEntry.className = `log-entry log-${type}`;
  logEntry.innerHTML = `
    <span class="timestamp">[${timestamp}]</span>
    <span class="message">${message}</span>
  `;

  activityContent.insertBefore(logEntry, activityContent.firstChild);

  // Keep only last 20 entries
  const entries = activityContent.querySelectorAll('.log-entry');
  if (entries.length > 20) {
    entries[entries.length - 1].remove();
  }
}

/**
 * Render all todos to the UI
 */
function renderTodos() {
  const todosList = document.getElementById('todos-list');

  if (window.todos.length === 0) {
    todosList.innerHTML = '<p class="empty-state">No todos yet. Add one above or use an AI agent!</p>';
    return;
  }

  todosList.innerHTML = window.todos.map(todo => `
    <div class="todo-item ${todo.completed ? 'completed' : ''}" data-id="${todo.id}">
      <input
        type="checkbox"
        ${todo.completed ? 'checked' : ''}
        onchange="toggleTodoComplete('${todo.id}')"
        id="check-${todo.id}"
      >
      <label for="check-${todo.id}" class="todo-text">${escapeHtml(todo.text)}</label>
      <button class="delete-btn" onclick="manualDeleteTodo('${todo.id}')" title="Delete">
        🗑️
      </button>
    </div>
  `).join('');
}

/**
 * Escape HTML to prevent XSS
 */
function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

/**
 * Toggle todo completion (for manual UI)
 */
function toggleTodoComplete(id) {
  const todo = window.todos.find(t => t.id === id);
  if (todo) {
    todo.completed = !todo.completed;
    renderTodos();
    logActivity(`Todo "${todo.text}" marked as ${todo.completed ? 'complete' : 'incomplete'}`, 'info');
  }
}

/**
 * Manual add todo (for human users)
 */
function manualAddTodo() {
  const input = document.getElementById('manual-todo-input');
  const text = input.value.trim();

  if (!text) {
    alert('Please enter a todo text');
    return;
  }

  const newTodo = {
    id: generateId(),
    text: text,
    completed: false,
    createdAt: new Date().toISOString()
  };

  window.todos.push(newTodo);
  renderTodos();
  input.value = '';

  logActivity(`Manual: Added todo "${text}"`, 'info');
}

/**
 * Manual delete todo (for human users)
 */
function manualDeleteTodo(id) {
  const todo = window.todos.find(t => t.id === id);
  if (todo) {
    window.todos = window.todos.filter(t => t.id !== id);
    renderTodos();
    logActivity(`Manual: Deleted todo "${todo.text}"`, 'info');
  }
}

// Allow Enter key to add todo
document.addEventListener('DOMContentLoaded', () => {
  const input = document.getElementById('manual-todo-input');
  if (input) {
    input.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') {
        manualAddTodo();
      }
    });
  }
});

// ============================================
// 3. WEBMCP AVAILABILITY CHECK
// ============================================

/**
 * Check if WebMCP is available in the browser
 */
function checkWebMCPAvailability() {
  const statusContent = document.getElementById('status-content');
  const statusCard = document.getElementById('webmcp-status');

  // Check for testing API (current Chrome Canary implementation)
  const hasTestingAPI = typeof window.navigator.modelContextTesting !== 'undefined';
  // Check for production API (future)
  const hasProductionAPI = typeof window.navigator.modelContext !== 'undefined';

  if (hasTestingAPI || hasProductionAPI) {
    const apiName = hasTestingAPI ? 'navigator.modelContextTesting' : 'navigator.modelContext';
    statusContent.innerHTML = `
      <p class="status-success">✅ WebMCP is available!</p>
      <p>Tools can be registered and used by AI agents.</p>
      <p class="status-detail">API: <code>${apiName}</code></p>
    `;
    statusCard.classList.add('status-active');
    return hasTestingAPI ? 'testing' : 'production';
  } else {
    statusContent.innerHTML = `
      <p class="status-error">❌ WebMCP is not available</p>
      <p><strong>Required:</strong></p>
      <ul>
        <li>Chrome version 146.0.7672.0 or higher</li>
        <li>Enable flag: <code>chrome://flags/#enable-webmcp-testing</code></li>
        <li>Restart Chrome after enabling the flag</li>
      </ul>
    `;
    statusCard.classList.add('status-inactive');
    return false;
  }
}

// ============================================
// 4. WEBMCP TOOL DEFINITIONS
// ============================================

/**
 * Register all WebMCP tools
 */
function registerWebMCPTools() {
  // NOTE: navigator.modelContext is for REGISTRATION
  //       navigator.modelContextTesting is for DISCOVERY (listTools)
  if (!window.navigator.modelContext) {
    console.error('WebMCP not available - navigator.modelContext is required for tool registration');
    return;
  }

  console.log('Registering tools with navigator.modelContext');

  // TOOL 1: Add Todo
  window.navigator.modelContext.registerTool({
    name: "add_todo",
    description: "Add a new item to the todo list. Use this when the user wants to create a new task or reminder.",
    inputSchema: {
      type: "object",
      properties: {
        text: {
          type: "string",
          description: "The todo item text. Should be a clear, actionable task description."
        }
      },
      required: ["text"]
    },
    execute: ({ text }) => {
      // Validate input
      if (!text || text.trim() === '') {
        logActivity('❌ Agent: Failed to add todo - empty text', 'error');
        return {
          content: [{
            type: "text",
            text: "Error: Todo text cannot be empty. Please provide a description for the todo item."
          }]
        };
      }

      // Create new todo
      const newTodo = {
        id: generateId(),
        text: text.trim(),
        completed: false,
        createdAt: new Date().toISOString()
      };

      // Add to list
      window.todos.push(newTodo);

      // Update UI
      renderTodos();

      // Log activity
      logActivity(`🤖 Agent: Added todo "${newTodo.text}"`, 'success');

      // Return success response
      return {
        content: [{
          type: "text",
          text: `Successfully added todo: "${newTodo.text}". Todo ID: ${newTodo.id}. Total todos: ${window.todos.length}`
        }]
      };
    }
  });

  // TOOL 2: Mark Todo as Complete
  window.navigator.modelContext.registerTool({
    name: "mark_complete",
    description: "Mark a todo item as complete. Use this when a task has been finished. You can get the todo ID from the list_todos tool.",
    inputSchema: {
      type: "object",
      properties: {
        todo_id: {
          type: "string",
          description: "The unique ID of the todo item to mark as complete. Get this from list_todos."
        }
      },
      required: ["todo_id"]
    },
    execute: ({ todo_id }) => {
      // Find the todo
      const todo = window.todos.find(t => t.id === todo_id);

      if (!todo) {
        logActivity(`❌ Agent: Failed to mark complete - todo ${todo_id} not found`, 'error');
        return {
          content: [{
            type: "text",
            text: `Error: Todo with ID "${todo_id}" not found. Use list_todos to see available todos and their IDs.`
          }]
        };
      }

      // Check if already complete
      if (todo.completed) {
        logActivity(`⚠️ Agent: Todo "${todo.text}" already complete`, 'warning');
        return {
          content: [{
            type: "text",
            text: `Todo "${todo.text}" is already marked as complete.`
          }]
        };
      }

      // Mark as complete
      todo.completed = true;

      // Update UI
      renderTodos();

      // Log activity
      logActivity(`🤖 Agent: Marked "${todo.text}" as complete`, 'success');

      // Return success response
      return {
        content: [{
          type: "text",
          text: `Successfully marked todo "${todo.text}" as complete.`
        }]
      };
    }
  });

  // TOOL 3: Delete Todo
  window.navigator.modelContext.registerTool({
    name: "delete_todo",
    description: "Delete a todo item from the list. Use this to remove tasks that are no longer needed. You can get the todo ID from the list_todos tool.",
    inputSchema: {
      type: "object",
      properties: {
        todo_id: {
          type: "string",
          description: "The unique ID of the todo item to delete. Get this from list_todos."
        }
      },
      required: ["todo_id"]
    },
    execute: ({ todo_id }) => {
      // Find the todo
      const todo = window.todos.find(t => t.id === todo_id);

      if (!todo) {
        logActivity(`❌ Agent: Failed to delete - todo ${todo_id} not found`, 'error');
        return {
          content: [{
            type: "text",
            text: `Error: Todo with ID "${todo_id}" not found. Use list_todos to see available todos and their IDs.`
          }]
        };
      }

      // Store text for logging
      const todoText = todo.text;

      // Delete the todo
      window.todos = window.todos.filter(t => t.id !== id);

      // Update UI
      renderTodos();

      // Log activity
      logActivity(`🤖 Agent: Deleted todo "${todoText}"`, 'success');

      // Return success response
      return {
        content: [{
          type: "text",
          text: `Successfully deleted todo "${todoText}". Remaining todos: ${window.todos.length}`
        }]
      };
    }
  });

  // TOOL 4: List All Todos
  window.navigator.modelContext.registerTool({
    name: "list_todos",
    description: "Get a list of all todos with their IDs, text, and completion status. Use this to see what tasks exist before performing other operations.",
    inputSchema: {
      type: "object",
      properties: {}
    },
    execute: () => {
      logActivity('🤖 Agent: Requested todo list', 'info');

      if (window.todos.length === 0) {
        return {
          content: [{
            type: "text",
            text: "No todos found. The todo list is currently empty."
          }]
        };
      }

      // Format todos as a structured list
      const todoList = window.todos.map((todo, index) => {
        return `${index + 1}. [${todo.completed ? '✓' : ' '}] ${todo.text}`;
      }).join('\n');

      const summary = {
        total: window.todos.length,
        completed: window.todos.filter(t => t.completed).length,
        pending: window.todos.filter(t => !t.completed).length,
        todos: window.todos.map(t => ({
          id: t.id,
          text: t.text,
          completed: t.completed,
          createdAt: t.createdAt
        }))
      };

      return {
        content: [{
          type: "text",
          text: `Todo List (${todos.length} total, ${summary.completed} completed, ${summary.pending} pending):\n\n${todoList}\n\nStructured data:\n${JSON.stringify(summary, null, 2)}`
        }]
      };
    }
  });

  console.log('✅ WebMCP tools registered successfully');
  logActivity('✅ WebMCP tools registered successfully', 'success');
  displayRegisteredTools();
}

/**
 * Display registered tools in the UI
 * Uses official WebMCP API to query registered tools
 */
function displayRegisteredTools() {
  const toolsList = document.getElementById('tools-list');

  // Use official WebMCP API to get registered tools
  const modelContextAPI = window.navigator.modelContextTesting || window.navigator.modelContext;

  if (!modelContextAPI || !modelContextAPI.listTools) {
    toolsList.innerHTML = '<p class="loading">WebMCP API not available for tool listing</p>';
    return;
  }

  try {
    const tools = modelContextAPI.listTools();

    if (!tools || tools.length === 0) {
      toolsList.innerHTML = '<p class="loading">No tools registered yet...</p>';
      return;
    }

    toolsList.innerHTML = tools.map(tool => `
      <div class="tool-card">
        <div class="tool-name"><code>${tool.name}</code></div>
        <div class="tool-description">${tool.description}</div>
        <div class="tool-params">Parameters: <code>${JSON.stringify(tool.inputSchema?.properties || {})}</code></div>
      </div>
    `).join('');
  } catch (error) {
    console.error('Error displaying tools:', error);
    toolsList.innerHTML = '<p class="loading">Error loading tools</p>';
  }
}

// ============================================
// 5. INITIALIZATION
// ============================================

/**
 * Initialize the application
 */
function init() {
  console.log('Initializing WebMCP Todo List Demo...');

  // Check WebMCP availability
  const isAvailable = checkWebMCPAvailability();

  if (isAvailable) {
    // Register WebMCP tools
    registerWebMCPTools();

    // Add some sample todos for testing
    window.todos = [
      {
        id: generateId(),
        text: "Try the Model Context Tool Inspector Extension",
        completed: false,
        createdAt: new Date().toISOString()
      },
      {
        id: generateId(),
        text: "Test adding a todo via AI agent",
        completed: false,
        createdAt: new Date().toISOString()
      }
    ];

    renderTodos();
    logActivity('🎉 Demo initialized with sample todos', 'info');
  } else {
    console.error('WebMCP is not available. Please check requirements.');
    logActivity('❌ WebMCP not available. Check requirements above.', 'error');
  }
}

// Run initialization when page loads
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}

// ============================================
// 6. DEBUGGING HELPERS
// ============================================

// Expose functions to global scope for debugging
window.todoDebug = {
  getTodos: () => window.todos,
  addSampleTodo: () => {
    manualAddTodo();
  },
  clearAllTodos: () => {
    window.todos = [];
    renderTodos();
    logActivity('🗑️ All todos cleared', 'info');
  },
  getWebMCPAPI: () => ({
    registration: window.navigator.modelContext,
    discovery: window.navigator.modelContextTesting
  })
};

console.log('Debug helpers available at window.todoDebug');
