import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import socket from "../socket";
import CodeEditor from "../components/Editor";
import API_BASE from "../config";
import Chat from "../components/Chat";

const LANGUAGES = [
  { id: "63", label: "JavaScript", ext: "js" },
  { id: "71", label: "Python",     ext: "py" },
  { id: "54", label: "C++",        ext: "cpp" },
  { id: "62", label: "Java",       ext: "java" },
];

const COLORS = ["#00ff87","#00e5ff","#ff7b72","#d2a8ff","#f0883e","#ffa657"];

function getColor(name) {
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
  return COLORS[Math.abs(hash) % COLORS.length];
}

function getInitials(name) {
  return name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2);
}

const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Space+Mono:wght@400;700&family=Syne:wght@400;600;700;800&display=swap');

  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

  :root {
    --bg:       #0d1117;
    --sidebar:  #0b0f14;
    --topbar:   #111820;
    --border:   #1e2a38;
    --green:    #00ff87;
    --cyan:     #00e5ff;
    --red:      #ff7b72;
    --text:     #e6edf3;
    --muted:    #6e7f8e;
    --mono:     'Space Mono', monospace;
    --display:  'Syne', sans-serif;
  }

  @keyframes blink { 0%,100%{opacity:1} 50%{opacity:0} }
  @keyframes fadeIn { from{opacity:0;transform:translateY(6px)} to{opacity:1;transform:none} }
  @keyframes fadeOut { from{opacity:1;transform:translateY(0)} to{opacity:0;transform:translateY(-6px)} }
  @keyframes spin   { to{transform:rotate(360deg)} }
  @keyframes pulse  {
    0%,100%{box-shadow:0 0 0 0 rgba(0,255,135,0.4)}
    50%    {box-shadow:0 0 0 8px rgba(0,255,135,0)}
  }
  @keyframes slideIn {
    from { opacity:0; transform: translateX(-10px); }
    to   { opacity:1; transform: translateX(0); }
  }
  @keyframes slideOut {
    from { opacity:1; transform: translateX(0); }
    to   { opacity:0; transform: translateX(-10px); }
  }

  .room-wrap {
    display: flex; flex-direction: column;
    height: 100vh; overflow: hidden;
    background: var(--bg); color: var(--text);
    font-family: var(--display);
  }

  /* TOP BAR */
  .room-topbar {
    height: 48px; flex-shrink: 0;
    display: flex; align-items: center;
    justify-content: space-between;
    padding: 0 16px;
    background: var(--topbar);
    border-bottom: 1px solid var(--border);
    gap: 12px; z-index: 10;
  }
  .room-logo {
    font-family: var(--mono); font-size: 13px; font-weight: 700;
    color: var(--green); display: flex; align-items: center; gap: 6px;
    white-space: nowrap;
  }
  .room-logo-dot {
    width: 6px; height: 6px; border-radius: 50%;
    background: var(--green); animation: blink 1.5s infinite;
  }
  .room-topbar-mid {
    display: flex; align-items: center; gap: 10px; flex: 1; justify-content: center;
  }
  .room-lang-select {
    background: var(--sidebar); border: 1px solid var(--border);
    color: var(--text); border-radius: 6px;
    padding: 5px 10px; font-family: var(--mono); font-size: 12px;
    outline: none; cursor: pointer; transition: border-color 0.2s;
  }
  .room-lang-select:focus { border-color: rgba(0,255,135,0.4); }
  .room-filename {
    font-family: var(--mono); font-size: 12px; color: var(--muted);
    padding: 4px 10px; background: var(--sidebar);
    border: 1px solid var(--border); border-radius: 6px;
  }
  .room-run-btn {
    display: flex; align-items: center; gap: 6px; padding: 6px 16px;
    background: var(--green); border: none; border-radius: 6px;
    font-family: var(--display); font-size: 13px; font-weight: 700;
    color: #000; cursor: pointer; transition: all 0.2s; white-space: nowrap;
    animation: pulse 2.5s infinite;
  }
  .room-run-btn:hover:not(:disabled) {
    background: #00ff9f; transform: translateY(-1px);
    box-shadow: 0 4px 16px rgba(0,255,135,0.3); animation: none;
  }
  .room-run-btn:disabled { opacity: 0.5; cursor: not-allowed; animation: none; }
  .room-spinner {
    width: 13px; height: 13px;
    border: 2px solid rgba(0,0,0,0.3); border-top-color: #000;
    border-radius: 50%; animation: spin 0.6s linear infinite;
  }
  .room-topbar-right { display: flex; align-items: center; gap: 10px; }
  .room-id-badge {
    font-family: var(--mono); font-size: 11px; color: var(--muted);
    padding: 4px 10px; border: 1px solid var(--border);
    border-radius: 6px; cursor: pointer; transition: all 0.2s;
    display: flex; align-items: center; gap: 6px; white-space: nowrap;
  }
  .room-id-badge:hover { border-color: rgba(0,255,135,0.3); color: var(--green); }
  .room-id-badge.copied { color: var(--green); border-color: rgba(0,255,135,0.3); }
  .room-leave-btn {
    padding: 5px 12px; background: transparent;
    border: 1px solid rgba(255,123,114,0.2); border-radius: 6px;
    font-family: var(--mono); font-size: 11px; color: var(--red);
    cursor: pointer; transition: all 0.2s; white-space: nowrap;
  }
  .room-leave-btn:hover { background: rgba(255,123,114,0.08); border-color: var(--red); }

  /* MAIN BODY */
  .room-body { display: flex; flex: 1; overflow: hidden; }

  /* LEFT SIDEBAR */
  .room-sidebar {
    width: 220px; flex-shrink: 0;
    background: var(--sidebar);
    border-right: 1px solid var(--border);
    display: flex; flex-direction: column; overflow: hidden;
  }
  .room-sidebar-header {
    padding: 14px 16px 10px; border-bottom: 1px solid var(--border);
    display: flex; align-items: center; justify-content: space-between;
  }
  .room-sidebar-title {
    font-family: var(--mono); font-size: 10px;
    letter-spacing: 2px; text-transform: uppercase; color: var(--muted);
  }
  .room-online-count {
    font-family: var(--mono); font-size: 10px; color: var(--green);
    background: rgba(0,255,135,0.08); border: 1px solid rgba(0,255,135,0.15);
    border-radius: 10px; padding: 1px 7px;
  }
  .room-participants-list { flex: 1; overflow-y: auto; padding: 10px; }
  .room-participants-list::-webkit-scrollbar { width: 3px; }
  .room-participants-list::-webkit-scrollbar-thumb { background: var(--border); border-radius: 2px; }

  .room-participant {
    display: flex; align-items: center; gap: 10px;
    padding: 8px 10px; border-radius: 8px; margin-bottom: 4px;
    transition: background 0.2s;
    animation: slideIn 0.3s ease both;
  }
  .room-participant.leaving {
    animation: slideOut 0.3s ease forwards;
  }
  .room-participant:hover { background: rgba(255,255,255,0.03); }

  .room-p-avatar {
    width: 32px; height: 32px; border-radius: 50%;
    display: flex; align-items: center; justify-content: center;
    font-family: var(--mono); font-size: 11px; font-weight: 700;
    color: #000; flex-shrink: 0;
  }
  .room-p-info { flex: 1; min-width: 0; }
  .room-p-name {
    font-size: 13px; font-weight: 600; color: var(--text);
    white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
  }
  .room-p-you { font-family: var(--mono); font-size: 9px; color: var(--muted); }
  .room-p-dot {
    width: 6px; height: 6px; border-radius: 50%;
    background: var(--green); flex-shrink: 0; animation: blink 2.5s infinite;
  }

  .room-sidebar-footer {
    padding: 12px 16px; border-top: 1px solid var(--border);
    font-family: var(--mono); font-size: 10px; color: var(--muted);
    display: flex; align-items: center; gap: 6px;
  }

  /* CENTER */
  .room-center { flex: 1; display: flex; flex-direction: column; overflow: hidden; min-width: 0; }
  .room-editor-wrap { flex: 1; overflow: hidden; position: relative; }

  /* OUTPUT */
  .room-output {
    height: 160px; flex-shrink: 0; background: #080c10;
    border-top: 1px solid var(--border);
    display: flex; flex-direction: column; overflow: hidden;
  }
  .room-output-header {
    display: flex; align-items: center; gap: 10px; padding: 8px 16px;
    border-bottom: 1px solid var(--border); flex-shrink: 0;
  }
  .room-output-title {
    font-family: var(--mono); font-size: 10px;
    letter-spacing: 2px; text-transform: uppercase; color: var(--muted);
  }
  .room-output-status { font-family: var(--mono); font-size: 10px; padding: 1px 8px; border-radius: 10px; }
  .room-output-status.ok  { color: var(--green); background: rgba(0,255,135,0.08); }
  .room-output-status.err { color: var(--red);   background: rgba(255,123,114,0.08); }
  .room-output-clear {
    margin-left: auto; background: none; border: none;
    font-family: var(--mono); font-size: 11px; color: var(--muted);
    cursor: pointer; transition: color 0.2s;
  }
  .room-output-clear:hover { color: var(--text); }
  .room-output-body { flex: 1; overflow-y: auto; padding: 10px 16px; }
  .room-output-body::-webkit-scrollbar { width: 3px; }
  .room-output-body::-webkit-scrollbar-thumb { background: var(--border); }
  .room-output-pre {
    font-family: var(--mono); font-size: 12px; line-height: 1.7;
    color: var(--text); white-space: pre-wrap; word-break: break-all;
  }
  .room-output-pre.has-err { color: var(--red); }
  .room-output-placeholder { font-family: var(--mono); font-size: 12px; color: var(--muted); font-style: italic; }

  /* RIGHT CHAT */
  .room-chat-panel {
    width: 280px; flex-shrink: 0;
    background: var(--sidebar);
    border-left: 1px solid var(--border);
    display: flex; flex-direction: column; overflow: hidden;
  }

  /* RESPONSIVE */
  @media (max-width: 900px) {
    .room-sidebar { display: none; }
  }
  @media (max-width: 650px) {
    .room-chat-panel { display: none; }
    .room-filename { display: none; }
  }
`;

export default function Room() {
  const { roomId } = useParams();
  const navigate = useNavigate();

  const [code, setCode] = useState("");
  const [participants, setParticipants] = useState([]);
  const [language, setLanguage] = useState("63");
  const [output, setOutput] = useState("");
  const [outputType, setOutputType] = useState("idle");
  const [running, setRunning] = useState(false);
  const [copied, setCopied] = useState(false);

  // Always get username from logged-in user — no prompt ever
  const username = (() => {
    try {
      const user = localStorage.getItem("user");
      if (user) {
        const parsed = JSON.parse(user);
        if (parsed?.name) return parsed.name;
      }
    } catch {}
    return "Anonymous";
  })();

  const currentLang = LANGUAGES.find((l) => l.id === language) || LANGUAGES[0];

  useEffect(() => {
    socket.emit("join-room", roomId, username);

    socket.on("participants", (users) => {
      setParticipants(users.filter((u) => u && u !== "null" && u !== "undefined"));
    });

    socket.on("code-update", (newCode) => setCode(newCode));

    return () => {
      socket.off("participants");
      socket.off("code-update");
    };
  }, [roomId]);

  const runCode = async () => {
    setRunning(true);
    setOutput("");
    setOutputType("idle");
    try {
      const res = await fetch(`${API_BASE}/api/code/run`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code, language }),
      });
      const data = await res.json();
      if (data.stderr) {
        setOutput(data.stderr);
        setOutputType("err");
      } else {
        setOutput(data.stdout || "No output");
        setOutputType("ok");
      }
    } catch {
      setOutput("Could not connect to server.");
      setOutputType("err");
    } finally {
      setRunning(false);
    }
  };

  const copyRoomId = () => {
    navigator.clipboard.writeText(roomId);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Emit leave-room before navigating away
  const leaveRoom = () => {
    socket.emit("leave-room", roomId);
    navigate("/");
  };

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: styles }} />
      <div className="room-wrap">

        {/* TOP BAR */}
        <div className="room-topbar">
          <div className="room-logo">
            <span className="room-logo-dot" /> LiveCode
          </div>
          <div className="room-topbar-mid">
            <select className="room-lang-select" value={language} onChange={(e) => setLanguage(e.target.value)}>
              {LANGUAGES.map((l) => <option key={l.id} value={l.id}>{l.label}</option>)}
            </select>
            <span className="room-filename">main.{currentLang.ext}</span>
            <button className="room-run-btn" onClick={runCode} disabled={running}>
              {running ? <><span className="room-spinner" /> Running...</> : <>▶ Run Code</>}
            </button>
          </div>
          <div className="room-topbar-right">
            <div className={`room-id-badge ${copied ? "copied" : ""}`} onClick={copyRoomId} title="Click to copy room code">
              <span>#</span><span>{roomId}</span><span>{copied ? "✓" : "⎘"}</span>
            </div>
            <button className="room-leave-btn" onClick={leaveRoom}>Leave</button>
          </div>
        </div>

        {/* MAIN BODY */}
        <div className="room-body">

          {/* LEFT — Participants */}
          <div className="room-sidebar">
            <div className="room-sidebar-header">
              <span className="room-sidebar-title">Participants</span>
              <span className="room-online-count">{participants.length} online</span>
            </div>
            <div className="room-participants-list">
              {participants.map((user, i) => (
                <div key={i} className="room-participant">
                  <div className="room-p-avatar" style={{ background: getColor(user) }}>
                    {getInitials(user)}
                  </div>
                  <div className="room-p-info">
                    <div className="room-p-name">{user}</div>
                    {user === username && <div className="room-p-you">you</div>}
                  </div>
                  <span className="room-p-dot" />
                </div>
              ))}
            </div>
            <div className="room-sidebar-footer">
              <span className="room-logo-dot" style={{ width: 5, height: 5 }} />
              Room · {roomId}
            </div>
          </div>

          {/* CENTER — Editor + Output */}
          <div className="room-center">
            <div className="room-editor-wrap">
              <CodeEditor
                code={code} setCode={setCode}
                socket={socket} roomId={roomId}
                language={currentLang.label.toLowerCase()}
                username={username}
              />
            </div>
            <div className="room-output">
              <div className="room-output-header">
                <span className="room-output-title">Output</span>
                {outputType !== "idle" && (
                  <span className={`room-output-status ${outputType}`}>
                    {outputType === "ok" ? "✓ Success" : "✕ Error"}
                  </span>
                )}
                {output && (
                  <button className="room-output-clear" onClick={() => { setOutput(""); setOutputType("idle"); }}>Clear</button>
                )}
              </div>
              <div className="room-output-body">
                {output
                  ? <pre className={`room-output-pre ${outputType === "err" ? "has-err" : ""}`}>{output}</pre>
                  : <span className="room-output-placeholder">Run your code to see output here...</span>
                }
              </div>
            </div>
          </div>

          {/* RIGHT — Chat */}
          <div className="room-chat-panel">
            <Chat socket={socket} roomId={roomId} username={username} onRoomExpired={leaveRoom} />
          </div>

        </div>
      </div>
    </>
  );
}