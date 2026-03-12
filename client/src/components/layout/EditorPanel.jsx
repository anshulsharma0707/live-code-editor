import CodeEditor from "../Editor"

const EditorPanel = ({
  code,
  setCode,
  socket,
  roomId,
  language,
  setLanguage,
  runCode,
  output
}) => {

  return (

    <div className="flex flex-col flex-1">

      {/* Toolbar */}

      <div className="flex items-center gap-3 p-2 bg-[#161b22] border-b border-[#30363d]">

        <select
          value={language}
          onChange={(e)=>setLanguage(e.target.value)}
          className="bg-[#0d1117] text-white p-1 rounded"
        >
          <option value="63">JavaScript</option>
          <option value="71">Python</option>
          <option value="54">C++</option>
          <option value="62">Java</option>
        </select>

        <button
          onClick={runCode}
          className="bg-green-600 px-3 py-1 rounded text-white"
        >
          ▶ Run
        </button>

      </div>


      {/* Editor */}

      <div className="flex-1">

        <CodeEditor
          code={code}
          setCode={setCode}
          socket={socket}
          roomId={roomId}
          language={language}
        />

      </div>


      {/* Output */}

      <div className="bg-black h-[160px] border-t border-[#30363d] p-3 overflow-auto">

        <h3 className="text-green-400 text-sm mb-2">
          OUTPUT
        </h3>

        <pre className="text-gray-200 text-sm">
          {output}
        </pre>

      </div>

    </div>

  )

}

export default EditorPanel