import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

import socket from "../socket";
import CodeEditor from "../components/Editor";
import Chat from "../components/Chat";

const Room = () => {

  const { roomId } = useParams();

  const [code, setCode] = useState("");
  const [participants, setParticipants] = useState([]);
  const [language, setLanguage] = useState("63");
  const [output, setOutput] = useState("");

  // username from localStorage
  const getUsername = () => {
    let name = localStorage.getItem("username");

    if (!name) {
      name = prompt("Enter your name");
      localStorage.setItem("username", name);
    }

    return name;
  };

  const username = getUsername();

  useEffect(() => {

    socket.emit("join-room", roomId, username);

    socket.on("participants", (users) => {
      setParticipants(users);
    });

    socket.on("code-update", (newCode) => {
      setCode(newCode);
    });

    return () => {
      socket.off("participants");
      socket.off("code-update");
    };

  }, [roomId]);


  // RUN CODE FUNCTION
  const runCode = async () => {

    try {

      const res = await fetch("http://localhost:5000/api/code/run", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          code,
          language
        })
      });

      const data = await res.json();

      setOutput(data.stdout || data.stderr || "No Output");

    } catch (error) {

      setOutput("Error running code");

    }

  };



  return (

    <div className="flex h-screen bg-[#1e1e1e] text-white">


      {/* PARTICIPANTS SIDEBAR */}
      <div className="w-56 bg-[#252526] p-4 border-r border-gray-700">

        <h2 className="text-lg font-semibold mb-4">Participants</h2>

        {participants.map((user, index) => (
          <div key={index} className="mb-2 bg-[#333] p-2 rounded">
            {user}
          </div>
        ))}

      </div>



      {/* EDITOR AREA */}
      <div className="flex flex-col flex-1">


        {/* TOP BAR */}
        <div className="flex items-center justify-between bg-[#333] p-2">

          <div className="flex items-center gap-3">

            <select
              value={language}
              onChange={(e)=>setLanguage(e.target.value)}
              className="bg-black p-1 rounded"
            >

              <option value="63">JavaScript</option>
              <option value="71">Python</option>
              <option value="54">C++</option>
              <option value="62">Java</option>

            </select>

            <button
              onClick={runCode}
              className="bg-green-600 px-3 py-1 rounded"
            >
              Run Code
            </button>

          </div>

          <div className="text-sm text-gray-300">
            Room: {roomId}
          </div>

        </div>



        {/* MONACO EDITOR */}
        <div className="flex-1">

          <CodeEditor
            code={code}
            setCode={setCode}
            socket={socket}
            roomId={roomId}
            language={language}
          />

        </div>



        {/* OUTPUT CONSOLE */}
        <div className="bg-black h-32 p-3 border-t border-gray-700 overflow-auto">

          <h3 className="text-green-400">Output</h3>

          <pre>{output}</pre>

        </div>


      </div>



      {/* CHAT PANEL */}
      <div className="w-64 bg-[#252526] border-l border-gray-700">

        <Chat
          socket={socket}
          roomId={roomId}
          username={username}
        />

      </div>


    </div>

  );

};

export default Room;
