import React, { useState, useEffect } from "react";

const Chat = ({ socket, roomId, username }) => {

  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);

  const sendMessage = () => {

    if (message.trim() === "") return;

    socket.emit("send-message", roomId, message, username);

    setMessage("");

  };

  useEffect(() => {

    socket.on("receive-message", (data) => {

      setMessages((prev) => [...prev, data]);

    });

  }, []);

  return (

    <div style={{ width: "250px", borderLeft: "1px solid gray", padding: "10px" }}>

      <h3>Chat</h3>

      <div style={{ height: "300px", overflowY: "scroll" }}>

        {messages.map((msg, index) => (
          <p key={index}>
            <b>{msg.username}:</b> {msg.message}
          </p>
        ))}

      </div>

      <input
        type="text"
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        placeholder="Type message..."
      />

      <button onClick={sendMessage}>Send</button>

    </div>

  );

};

export default Chat;