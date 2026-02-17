/**
 * WebMCP Background Service Worker
 *
 * Manages:
 * - Side panel opening
 * - Tool discovery coordination
 * - Communication between content scripts and side panel
 */

console.log('🚀 WebMCP Background service worker started');

// Store discovered tools per tab
const tabTools = new Map();

// Open side panel when extension icon is clicked
chrome.action.onClicked.addListener((tab) => {
  chrome.sidePanel.open({ windowId: tab.windowId });
  console.log('📱 Side panel opened for window:', tab.windowId);
});

// Listen for messages from content scripts and side panel
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  const { type, data } = message;

  switch (type) {
    case 'TOOLS_DISCOVERED':
      // Content script discovered tools
      if (sender.tab) {
        const tabId = sender.tab.id;
        tabTools.set(tabId, data);
        console.log(`📋 Stored ${data.tools?.length || 0} tools for tab ${tabId}`);

        // Forward to side panel if it's open
        // (side panel listens via its own runtime.onMessage)
        broadcastToSidePanel(message);
      }
      break;

    case 'GET_TAB_TOOLS':
      // Side panel requesting tools for a specific tab
      const tools = tabTools.get(data.tabId) || { available: false, tools: [] };
      sendResponse(tools);
      return true;

    default:
      break;
  }
});

// Broadcast message to all side panels
function broadcastToSidePanel(message) {
  // Note: In Manifest V3, we can't directly message the side panel
  // The side panel must query the background for data
  // So we rely on the content script to send messages directly
  console.log('📡 Broadcasting to side panel:', message.type);
}

// Clean up tools when tab is closed
chrome.tabs.onRemoved.addListener((tabId) => {
  if (tabTools.has(tabId)) {
    tabTools.delete(tabId);
    console.log(`🗑️ Cleaned up tools for closed tab ${tabId}`);
  }
});
