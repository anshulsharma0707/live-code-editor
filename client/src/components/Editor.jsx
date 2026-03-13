import React from "react";
import Editor from "@monaco-editor/react";

// Map language label to Monaco language ID
const MONACO_LANG = {
  javascript: "javascript",
  python:     "python",
  "c++":      "cpp",
  java:       "java",
};

const CodeEditor = ({ code, setCode, socket, roomId, language }) => {
  const monacoLang = MONACO_LANG[language?.toLowerCase()] || "javascript";

  const handleChange = (value) => {
    setCode(value);
    socket.emit("code-change", roomId, value);
  };

  const handleMount = (editor) => {
    // Cursor sync
    editor.onDidChangeCursorPosition((event) => {
      socket.emit("cursor-change", roomId, event.position);
    });

    // Monaco editor cosmetic options
    editor.updateOptions({
      fontSize: 14,
      fontFamily: "'Space Mono', 'Fira Code', monospace",
      fontLigatures: true,
      lineHeight: 22,
      minimap: { enabled: true, scale: 1 },
      scrollBeyondLastLine: false,
      smoothScrolling: true,
      cursorBlinking: "smooth",
      cursorSmoothCaretAnimation: "on",
      renderLineHighlight: "all",
      bracketPairColorization: { enabled: true },
      padding: { top: 16, bottom: 16 },
      scrollbar: {
        verticalScrollbarSize: 6,
        horizontalScrollbarSize: 6,
      },
    });
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
        fontSize: 14,
        fontFamily: "'Space Mono', 'Fira Code', monospace",
        minimap: { enabled: true },
        scrollBeyondLastLine: false,
        smoothScrolling: true,
        padding: { top: 16 },
      }}
    />
  );
};

export default CodeEditor;