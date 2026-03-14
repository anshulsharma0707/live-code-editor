import React, { useRef, useEffect } from "react";
import Editor from "@monaco-editor/react";

// Map language label -> Monaco language id
const MONACO_LANG = {
  javascript: "javascript",
  python:     "python",
  "c++":      "cpp",
  java:       "java",
};

// Deterministic color palette for remote cursors
const CURSOR_COLORS = [
  { bg: "#00ff87", text: "#000" },
  { bg: "#00e5ff", text: "#000" },
  { bg: "#d2a8ff", text: "#000" },
  { bg: "#ffa657", text: "#000" },
  { bg: "#ff7b72", text: "#fff" },
  { bg: "#f0883e", text: "#000" },
];

function getColorForUser(username) {
  let hash = 0;
  for (let i = 0; i < username.length; i++) {
    hash = username.charCodeAt(i) + ((hash << 5) - hash);
  }
  return CURSOR_COLORS[Math.abs(hash) % CURSOR_COLORS.length];
}

// Inject once — cursor CSS for all remote users
function injectCursorStyles() {
  if (document.getElementById("lc-cursor-styles")) return;
  const style = document.createElement("style");
  style.id = "lc-cursor-styles";
  style.textContent = `
    .lc-remote-cursor {
      position: absolute;
      width: 2px;
      pointer-events: none;
      z-index: 100;
    }
    .lc-cursor-label {
      position: absolute;
      top: -20px;
      left: 0;
      font-size: 11px;
      font-family: 'Space Mono', monospace;
      font-weight: 700;
      padding: 2px 7px;
      border-radius: 4px;
      white-space: nowrap;
      pointer-events: none;
      z-index: 101;
      letter-spacing: 0.3px;
      line-height: 16px;
    }
  `;
  document.head.appendChild(style);
}

const CodeEditor = ({ code, setCode, socket, roomId, language, username }) => {
  const monacoLang = MONACO_LANG[language?.toLowerCase()] || "javascript";

  // Refs to hold Monaco editor instance and decoration state
  const editorRef       = useRef(null);
  const monacoRef       = useRef(null);
  const decorationsRef  = useRef({}); // socketId -> decoration collection
  const widgetsRef      = useRef({}); // socketId -> cursor widget DOM node

  useEffect(() => {
    injectCursorStyles();
  }, []);

  // ── Socket listeners for remote cursors ──
  useEffect(() => {
    if (!socket) return;

    socket.on("cursor-update", ({ socketId, username: remoteUser, position }) => {
      renderRemoteCursor(socketId, remoteUser, position);
    });

    socket.on("cursor-removed", ({ socketId }) => {
      removeRemoteCursor(socketId);
    });

    // Clean up all cursors when participants change
    socket.on("participants", (users) => {
      // Remove cursors of users who are no longer in the room
      Object.keys(widgetsRef.current).forEach((sid) => {
        // We don't have a socketId->name map here,
        // so we leave cleanup to cursor-removed / disconnect
      });
    });

    return () => {
      socket.off("cursor-update");
      socket.off("cursor-removed");
    };
  }, [socket]);

  // ── Render a remote cursor using Monaco overlay widget ──
  const renderRemoteCursor = (socketId, remoteUser, position) => {
    const editor = editorRef.current;
    const monaco = monacoRef.current;
    if (!editor || !monaco) return;

    const color = getColorForUser(remoteUser);

    // Remove old widget if exists
    removeRemoteCursor(socketId);

    // Create cursor widget DOM node
    const widgetNode = document.createElement("div");
    widgetNode.style.cssText = `
      position: absolute;
      display: flex;
      flex-direction: column;
      align-items: flex-start;
      pointer-events: none;
      z-index: 100;
    `;

    // Cursor line (blinking bar)
    const bar = document.createElement("div");
    bar.style.cssText = `
      width: 2px;
      height: 18px;
      background: ${color.bg};
      border-radius: 1px;
      animation: lc-blink 1.2s ease-in-out infinite;
    `;

    // Name label
    const label = document.createElement("div");
    label.className = "lc-cursor-label";
    label.style.cssText = `
      position: absolute;
      top: -20px;
      left: 0;
      font-size: 11px;
      font-family: 'Space Mono', monospace;
      font-weight: 700;
      padding: 2px 7px;
      border-radius: 4px;
      white-space: nowrap;
      pointer-events: none;
      background: ${color.bg};
      color: ${color.text};
      letter-spacing: 0.3px;
      line-height: 16px;
    `;
    label.textContent = remoteUser;

    widgetNode.appendChild(label);
    widgetNode.appendChild(bar);

    // Monaco overlay widget
    const widget = {
      getId:         () => `cursor-${socketId}`,
      getDomNode:    () => widgetNode,
      getPosition:   () => ({
        position: { lineNumber: position.lineNumber, column: position.column },
        preference: [monaco.editor.OverlayWidgetPositionPreference.TOP_CENTER],
      }),
    };

    // Use content widget for precise line/col placement
    const contentWidget = {
      getId:      () => `cursor-cw-${socketId}`,
      getDomNode: () => widgetNode,
      getPosition: () => ({
        position: { lineNumber: position.lineNumber, column: position.column },
        preference: [
          monaco.editor.ContentWidgetPositionPreference.EXACT,
        ],
      }),
    };

    editor.addContentWidget(contentWidget);
    widgetsRef.current[socketId] = contentWidget;

    // Also add line highlight decoration
    const newDec = editor.createDecorationsCollection([
      {
        range: new monaco.Range(
          position.lineNumber, 1,
          position.lineNumber, 1
        ),
        options: {
          isWholeLine: true,
          className: `lc-remote-line-${socketId}`,
          overviewRulerColor: color.bg,
          overviewRulerLane: monaco.editor.OverviewRulerLane.Right,
        },
      },
    ]);

    // Inject line highlight style
    injectLineStyle(socketId, color.bg);
    decorationsRef.current[socketId] = newDec;
  };

  // Inject per-user line highlight color
  const injectLineStyle = (socketId, bgColor) => {
    const id = `lc-line-style-${socketId}`;
    if (document.getElementById(id)) return;
    const style = document.createElement("style");
    style.id = id;
    style.textContent = `.lc-remote-line-${socketId} { background: ${bgColor}18 !important; border-left: 2px solid ${bgColor}80 !important; }`;
    document.head.appendChild(style);
  };

  // Remove a remote cursor + decoration
  const removeRemoteCursor = (socketId) => {
    const editor = editorRef.current;
    if (!editor) return;

    // Remove content widget
    if (widgetsRef.current[socketId]) {
      try { editor.removeContentWidget(widgetsRef.current[socketId]); } catch {}
      delete widgetsRef.current[socketId];
    }

    // Clear decoration
    if (decorationsRef.current[socketId]) {
      try { decorationsRef.current[socketId].clear(); } catch {}
      delete decorationsRef.current[socketId];
    }
  };

  // ── Editor mount ──
  const handleMount = (editor, monaco) => {
    editorRef.current  = editor;
    monacoRef.current  = monaco;

    // Inject blink keyframe once
    const blinkStyle = document.createElement("style");
    blinkStyle.textContent = `
      @keyframes lc-blink {
        0%, 100% { opacity: 1; }
        50%       { opacity: 0.2; }
      }
    `;
    document.head.appendChild(blinkStyle);

    // Emit cursor position on every move
    editor.onDidChangeCursorPosition((event) => {
      if (socket && roomId) {
        socket.emit("cursor-change", roomId, {
          lineNumber: event.position.lineNumber,
          column:     event.position.column,
        });
      }
    });

    // Emit cursor-remove when editor loses focus
    editor.onDidBlurEditorWidget(() => {
      if (socket && roomId) {
        socket.emit("cursor-remove", roomId);
      }
    });

    // Monaco cosmetic options
    editor.updateOptions({
      fontSize:                    14,
      fontFamily:                  "'Space Mono', 'Fira Code', monospace",
      fontLigatures:               true,
      lineHeight:                  22,
      minimap:                     { enabled: true, scale: 1 },
      scrollBeyondLastLine:        false,
      smoothScrolling:             true,
      cursorBlinking:              "smooth",
      cursorSmoothCaretAnimation:  "on",
      renderLineHighlight:         "all",
      bracketPairColorization:     { enabled: true },
      padding:                     { top: 16, bottom: 16 },
      scrollbar: {
        verticalScrollbarSize:   6,
        horizontalScrollbarSize: 6,
      },
    });
  };

  const handleChange = (value) => {
    setCode(value);
    if (socket && roomId) socket.emit("code-change", roomId, value);
  };

  return (
    <Editor
      height="100%"
      language={monacoLang}
      theme="vs-dark"
      value={code}
      onChange={handleChange}
      onMount={handleMount}
      options={{
        fontSize:            14,
        fontFamily:          "'Space Mono', 'Fira Code', monospace",
        minimap:             { enabled: true },
        scrollBeyondLastLine: false,
        smoothScrolling:     true,
        padding:             { top: 16 },
      }}
    />
  );
};

export default CodeEditor;