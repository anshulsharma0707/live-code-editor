import React, { useState, useEffect, useRef } from "react";

const COLORS = ["#00ff87","#00e5ff","#ff7b72","#d2a8ff","#f0883e","#ffa657"];

function getColor(name) {
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
  return COLORS[Math.abs(hash) % COLORS.length];
}

function getInitials(name) {
  return name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2);
}

const chatStyles = `
  @keyframes msgIn {
    from { opacity: 0; transform: translateY(8px); }
    to   { opacity: 1; transform: none; }
  }

  .chat-wrap {
    display: flex; flex-direction: column;
    height: 100%; overflow: hidden;
    font-family: 'Syne', sans-serif;
  }

  .chat-header {
    padding: 14px 16px;
    border-bottom: 1px solid #1e2a38;
    display: flex; align-items: center; justify-content: space-between;
    flex-shrink: 0;
  }
  .chat-header-title {
    font-family: 'Space Mono', monospace;
    font-size: 10px; letter-spacing: 2px;
    text-transform: uppercase; color: #6e7f8e;
    display: flex; align-items: center; gap: 8px;
  }
  .chat-unread {
    background: #00ff87; color: #000;
    font-size: 9px; font-weight: 700;
    border-radius: 10px; padding: 1px 6px;
    font-family: 'Space Mono', monospace;
  }

  .chat-messages {
    flex: 1; overflow-y: auto;
    padding: 12px 14px;
    display: flex; flex-direction: column; gap: 2px;
  }
  .chat-messages::-webkit-scrollbar { width: 3px; }
  .chat-messages::-webkit-scrollbar-thumb { background: #1e2a38; border-radius: 2px; }

  .chat-msg {
    animation: msgIn 0.2s ease both;
    padding: 6px 10px; border-radius: 8px;
    max-width: 100%;
  }
  .chat-msg.own {
    background: rgba(0,255,135,0.06);
    border: 1px solid rgba(0,255,135,0.1);
    align-self: flex-end;
  }
  .chat-msg.other {
    background: rgba(255,255,255,0.03);
    border: 1px solid #1e2a38;
    align-self: flex-start;
  }
  .chat-msg.system {
    background: transparent;
    border: none; align-self: center;
    text-align: center;
  }

  .chat-msg-meta {
    display: flex; align-items: center; gap: 6px;
    margin-bottom: 4px;
  }
  .chat-msg-avatar {
    width: 18px; height: 18px; border-radius: 50%;
    display: flex; align-items: center; justify-content: center;
    font-family: 'Space Mono', monospace; font-size: 8px;
    font-weight: 700; color: #000; flex-shrink: 0;
  }
  .chat-msg-name {
    font-family: 'Space Mono', monospace;
    font-size: 10px; font-weight: 700;
  }
  .chat-msg-time {
    font-family: 'Space Mono', monospace;
    font-size: 9px; color: #6e7f8e;
    margin-left: auto;
  }

  .chat-msg-text {
    font-size: 13px; line-height: 1.5;
    color: #e6edf3; word-break: break-word;
  }
  .chat-msg.own .chat-msg-text { color: #c8fce5; }
  .chat-msg.system .chat-msg-text {
    font-family: 'Space Mono', monospace;
    font-size: 10px; color: #6e7f8e; font-style: italic;
  }

  .chat-empty {
    flex: 1; display: flex; flex-direction: column;
    align-items: center; justify-content: center;
    gap: 8px; color: #6e7f8e; text-align: center;
    padding: 20px;
  }
  .chat-empty-icon { font-size: 28px; opacity: 0.4; }
  .chat-empty-text {
    font-family: 'Space Mono', monospace;
    font-size: 11px; line-height: 1.6;
  }

  .chat-input-wrap {
    padding: 12px 14px;
    border-top: 1px solid #1e2a38;
    flex-shrink: 0;
  }
  .chat-input-row {
    display: flex; gap: 8px; align-items: flex-end;
  }
  .chat-input {
    flex: 1; background: #080c10;
    border: 1px solid #1e2a38; border-radius: 8px;
    padding: 8px 12px; color: #e6edf3;
    font-family: 'Syne', sans-serif; font-size: 13px;
    outline: none; resize: none;
    transition: border-color 0.2s;
    line-height: 1.4; max-height: 80px;
    scrollbar-width: none;
  }
  .chat-input:focus { border-color: rgba(0,255,135,0.35); }
  .chat-input::placeholder { color: #6e7f8e; }
  .chat-send-btn {
    width: 36px; height: 36px; flex-shrink: 0;
    background: #00ff87; border: none; border-radius: 8px;
    cursor: pointer; transition: all 0.2s;
    display: flex; align-items: center; justify-content: center;
    font-size: 14px;
  }
  .chat-send-btn:hover { background: #00ff9f; transform: translateY(-1px); }
  .chat-send-btn:disabled { opacity: 0.4; cursor: not-allowed; transform: none; }

  .chat-hint {
    margin-top: 6px;
    font-family: 'Space Mono', monospace;
    font-size: 10px; color: #6e7f8e;
    text-align: right;
  }
`;

function formatTime(date) {
  return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

const Chat = ({ socket, roomId, username, onRoomExpired }) => {
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);
  const [unread, setUnread] = useState(0);
  const [focused, setFocused] = useState(false);
  const bottomRef = useRef(null);
  const textareaRef = useRef(null);

  // Load chat history on mount + listen for new messages
  useEffect(() => {
    // Server sends full chat history when user joins
    socket.on("chat-history", (history) => {
      const parsed = history.map((m) => ({
        type: m.username === username ? "own" : "other",
        username: m.username,
        text: m.message,
        time: new Date(m.time),
      }));
      setMessages([
        { type: "system", text: "You joined the room", time: new Date() },
        ...parsed,
      ]);
    });

    socket.on("receive-message", (data) => {
      // Skip if it's our own message (already added locally)
      if (data.username === username) return;
      setMessages((prev) => [
        ...prev,
        { type: "other", username: data.username, text: data.message, time: new Date(data.time) },
      ]);
      if (!focused) setUnread((u) => u + 1);
    });

    socket.on("user-left", ({ username: leftUser }) => {
      setMessages((prev) => [
        ...prev,
        { type: "system", text: `${leftUser} left the room`, time: new Date() },
      ]);
    });

    // Room expired after 1hr inactivity
    socket.on("room-expired", ({ message: msg }) => {
      setMessages((prev) => [
        ...prev,
        { type: "system", text: "⏱ Room closed due to 1hr inactivity", time: new Date() },
      ]);
      if (onRoomExpired) setTimeout(onRoomExpired, 3000);
    });

    return () => {
      socket.off("chat-history");
      socket.off("receive-message");
      socket.off("user-left");
      socket.off("room-expired");
    };
  }, [focused, username]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = () => {
    if (!message.trim()) return;
    socket.emit("send-message", roomId, message.trim(), username);
    // Add own message immediately (don't wait for server echo)
    setMessages((prev) => [
      ...prev,
      { type: "own", username, text: message.trim(), time: new Date() },
    ]);
    setMessage("");
    textareaRef.current?.focus();
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const handleFocus = () => {
    setFocused(true);
    setUnread(0);
  };

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: chatStyles }} />
      <div className="chat-wrap">

        <div className="chat-header">
          <span className="chat-header-title">
            💬 Chat
            {unread > 0 && <span className="chat-unread">{unread}</span>}
          </span>
        </div>

        {messages.length === 0 ? (
          <div className="chat-empty">
            <div className="chat-empty-icon">💬</div>
            <div className="chat-empty-text">
              No messages yet.<br />Say hello to your team!
            </div>
          </div>
        ) : (
          <div className="chat-messages" onFocus={handleFocus} onClick={handleFocus}>
            {messages.map((msg, i) => {
              if (msg.type === "system") {
                return (
                  <div key={i} className="chat-msg system">
                    <span className="chat-msg-text">— {msg.text} —</span>
                  </div>
                );
              }
              const isOwn = msg.type === "own";
              return (
                <div key={i} className={`chat-msg ${isOwn ? "own" : "other"}`}>
                  <div className="chat-msg-meta">
                    {!isOwn && (
                      <div
                        className="chat-msg-avatar"
                        style={{ background: getColor(msg.username) }}
                      >
                        {getInitials(msg.username)}
                      </div>
                    )}
                    <span
                      className="chat-msg-name"
                      style={{ color: isOwn ? "#00ff87" : getColor(msg.username) }}
                    >
                      {isOwn ? "You" : msg.username}
                    </span>
                    <span className="chat-msg-time">{formatTime(msg.time)}</span>
                  </div>
                  <div className="chat-msg-text">{msg.text}</div>
                </div>
              );
            })}
            <div ref={bottomRef} />
          </div>
        )}

        <div className="chat-input-wrap">
          <div className="chat-input-row">
            <textarea
              ref={textareaRef}
              className="chat-input"
              placeholder="Type a message..."
              value={message}
              rows={1}
              onChange={(e) => setMessage(e.target.value)}
              onKeyDown={handleKeyDown}
              onFocus={handleFocus}
            />
            <button
              className="chat-send-btn"
              onClick={sendMessage}
              disabled={!message.trim()}
              title="Send"
            >
              ↑
            </button>
          </div>
          <div className="chat-hint">Enter to send · Shift+Enter for new line</div>
        </div>

      </div>
    </>
  );
};

export default Chat;