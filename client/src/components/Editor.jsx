import React from "react";
import Editor from "@monaco-editor/react";

const CodeEditor = ({ code, setCode, socket, roomId }) => {

  const handleChange = (value) => {

    setCode(value);

    socket.emit("code-change", roomId, value);

  };

  const handleCursor = (event) => {

    const position = event.position;

    socket.emit("cursor-change", roomId, position);

  };

  return (

    <Editor
      height="90vh"
      defaultLanguage="javascript"
      theme="vs-dark"
      value={code}
      onChange={handleChange}
      onMount={(editor) => {

        editor.onDidChangeCursorPosition(handleCursor);

      }}
    />

  );

};

export default CodeEditor;