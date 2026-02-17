# Screenshots Guide

This directory contains all screenshots needed for the README.md and blog posts.

## 📸 Required Screenshots

### For README.md (7 screenshots)

#### 1. **demo-hero.png** - Hero/Banner Image
**What to capture:** Full browser window showing:
- Todo list website on the left
- Extension side panel on the right
- AI agent adding todos via chat
- At least 2-3 todos visible in the list

**Size:** 1920x1080 (Full HD) or 1440x900
**Tip:** Make sure browser chrome/toolbar is visible showing localhost:8080

---

#### 2. **chrome-flags-webmcp.png** - WebMCP Flag Enabled
**What to capture:** Chrome flags page (`chrome://flags/#enable-webmcp-testing`)
- "WebMCP for testing" flag visible
- Set to "Enabled" (highlighted)
- "Relaunch" button visible at bottom

**Size:** 1200x800 (or full browser width)
**Tip:** Use search to highlight the flag, crop to show just the relevant section

---

#### 3. **devtools-verify-modelcontext.png** - DevTools Console
**What to capture:** Browser DevTools console showing:
- Command: `navigator.modelContext` typed in console
- Output: `{registerTool: ƒ, unregisterTool: ƒ, provideContext: ƒ, clearContext: ƒ}`
- Maybe add a green arrow pointing to the output

**Size:** 800x400 (console panel only)
**Tip:** Clear console first, then run the command for a clean screenshot

---

#### 4. **extension-loaded.png** - Chrome Extensions Page
**What to capture:** `chrome://extensions/` page showing:
- "WebMCP Local AI Agent" extension card
- Version 1.0.0
- "Developer mode" toggle ON
- Extension icon visible
- No error messages

**Size:** 1000x600
**Tip:** Pin extension to toolbar first, show the pin icon in toolbar

---

#### 5. **demo-website.png** - Todo List UI
**What to capture:** Clean view of the todo list website
- Todo list with 2-3 sample items
- Activity log showing some events
- Browser toolbar showing localhost:8080
- Maybe show "Tools Registered" indicator

**Size:** 1200x900
**Tip:** Add some todos first to make it look realistic

---

#### 6. **sidepanel-tools-discovered.png** - Extension Side Panel
**What to capture:** Extension side panel showing:
- "✅ Ollama connected" status
- "🔧 4 tools available" indicator
- List of discovered tools (add_todo, list_todos, mark_complete, delete_todo)
- Chat interface at bottom
- Maybe a system message showing tools discovered

**Size:** 400x800 (vertical)
**Tip:** Open side panel by clicking extension icon

---

#### 7. **demo-in-action.png** - Live Demo
**What to capture:** Split view showing:
- Left: Todo list with items being added
- Right: Side panel with chat conversation
- Show AI adding a todo in real-time
- Activity log showing the action

**Size:** 1600x900 (wide)
**Tip:** Use browser's responsive design mode or zoom to fit both panels

---

#### 8. **architecture-diagram.png** - System Architecture
**What to create:** Diagram showing:
```
┌─────────────────┐
│   Web Page      │
│   (localhost)   │
│   - Todo List   │
│   - 4 Tools     │
└────────┬────────┘
         │ WebMCP APIs
         │
┌────────▼────────┐
│ Chrome Extension│
│ - Content Script│
│ - Side Panel    │
└────────┬────────┘
         │ HTTP API
         │
┌────────▼────────┐
│     Ollama      │
│  (qwen2.5:7b)   │
│   localhost:    │
│     11434       │
└─────────────────┘
```

**Tool:** Use draw.io, Excalidraw, or any diagram tool
**Size:** 800x600
**Style:** Simple, clean, professional

---

### For BLOG-2-TECHNICAL.md (5 screenshots)

#### 1. **blog-hero-demo.png** - Blog Hero Image
**Same as demo-hero.png** above, but can be wider aspect ratio
**Size:** 1920x1080
**Tip:** Make it visually appealing for blog header

---

#### 2. **blog-devtools-tools-discovered.png** - DevTools Console
**What to capture:** Browser console showing:
- Console logs from content script
- "✅ Discovered 4 tools using OFFICIAL API"
- Array of tool objects visible
- Expand one tool object to show structure

**Size:** 1000x600
**Tip:** Run extension on demo page, check console logs

---

#### 3. **blog-ollama-terminal.png** - Ollama Running
**What to capture:** Terminal showing:
- Command: `OLLAMA_ORIGINS="chrome-extension://*" ollama serve`
- Ollama startup messages
- Listening on 127.0.0.1:11434
- Model loaded message

**Size:** 800x400
**Tip:** Use a clean terminal (iTerm2, Windows Terminal), dark theme preferred

---

#### 4. **blog-final-demo.png** - Complete Working Demo
**What to capture:** Full screen showing:
- Browser with todo list (left)
- Extension side panel (right)
- Chat conversation with multiple exchanges
- Todos being added/completed
- Activity log showing AI actions

**Size:** 1600x1000
**Tip:** This should show the "wow factor" - make it impressive!

---

## 🎨 Screenshot Best Practices

### General Guidelines:
1. **Resolution:** At least 1200px wide for main screenshots
2. **Format:** PNG (for sharp text) or JPG (for photos)
3. **Compression:** Optimize images before committing (use TinyPNG or similar)
4. **Consistency:** Use same browser theme across all screenshots
5. **Clean:** Close unnecessary tabs, hide personal info

### Browser Settings:
- Use Chrome Canary (shows version)
- Clean bookmarks bar or hide it
- Close unnecessary tabs (keep 1-2 max)
- Use Incognito mode if needed for clean UI

### Tools for Screenshots:
- **macOS:** Cmd+Shift+4 (region), Cmd+Shift+3 (full screen)
- **Windows:** Windows+Shift+S (Snipping Tool)
- **Linux:** Flameshot, Spectacle, or built-in screenshot tool
- **Chrome Extension:** Awesome Screenshot, Nimbus Screenshot

### Annotations (Optional):
- Add arrows pointing to important features (use tool like Snagit, Skitch)
- Highlight key areas with colored boxes
- Add text labels for clarity

---

## 📝 File Naming Convention

All files should match the exact names used in README.md and blog files:

```
screenshots/
├── demo-hero.png
├── chrome-flags-webmcp.png
├── devtools-verify-modelcontext.png
├── extension-loaded.png
├── demo-website.png
├── sidepanel-tools-discovered.png
├── demo-in-action.png
├── architecture-diagram.png
├── blog-hero-demo.png
├── blog-code-ide-view.png
├── blog-devtools-tools-discovered.png
├── blog-ollama-terminal.png
└── blog-final-demo.png
```

---

## ✅ Checklist

Before you're done, verify:

- [ ] All 13 screenshot files created
- [ ] Files named exactly as listed above
- [ ] Images are clear and readable (text not blurry)
- [ ] No personal information visible
- [ ] Consistent browser theme/appearance
- [ ] Images optimized (< 500KB each if possible)
- [ ] Architecture diagram looks professional
- [ ] All screenshots show the actual working demo

---

## 🚀 Quick Capture Session

**Recommended order:**

1. Start with Chrome setup screenshots (flags, extensions, devtools)
2. Then capture Ollama terminal
3. Then capture demo website and side panel
4. Finally capture the demo in action
5. Create architecture diagram last

**Estimated time:** 20-30 minutes for all screenshots

---

## 💡 Pro Tips

1. **Take multiple shots:** Capture several versions and pick the best
2. **Zoom for readability:** Code and console text should be easily readable
3. **Show real data:** Use realistic todo examples ("Buy groceries", not "test123")
4. **Highlight success:** Show green checkmarks, success messages
5. **Brand consistently:** Same color scheme throughout

---

## 📧 Questions?

If you're unsure about any screenshot:
- Check the context in README.md or blog post
- Look at the caption/description for guidance
- Take the screenshot that best illustrates the feature
- Better to have too much visible than too little (can crop later)

---

**Remember:** These screenshots are crucial for:
- Helping users understand the setup process
- Showing the final working result
- Making the GitHub repo and blog posts more engaging
- Increasing project credibility

Take your time and make them look good! 📸✨
