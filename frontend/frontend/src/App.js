import React, { useState, useEffect } from "react";
import { io } from "socket.io-client";
import './App.css';

// Backend server URL
const SERVER = "http://localhost:3001";
const socket = io(SERVER);

function App() {
  const [name, setName] = useState("");
  const [joined, setJoined] = useState(false);
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");
  const [typingUsers, setTypingUsers] = useState({});

  useEffect(() => {
    socket.on("connect", () => console.log("Connected:", socket.id));

    socket.on("receiveMessage", (msg) => {
      setMessages((prev) => [...prev, msg]);
    });

    socket.on("typing", ({ username, isTyping }) => {
      setTypingUsers((prev) => ({ ...prev, [username]: isTyping }));
      if (!isTyping)
        setTimeout(() => {
          setTypingUsers((prev) => {
            const p = { ...prev };
            delete p[username];
            return p;
          });
        }, 3000);
    });

    return () => {
      socket.off("receiveMessage");
      socket.off("typing");
    };
  }, []);

  const join = () => {
    if (!name) return alert("Enter your name");
    setJoined(true);
  };

  const send = (e) => {
    e.preventDefault();
    if (!text) return;
    const msg = { user: name, text, time: new Date().toLocaleTimeString() };
    socket.emit("sendMessage", msg);
    setText("");
    socket.emit("typing", { username: name, isTyping: false });
  };

  const handleTyping = (val) => {
    setText(val);
    socket.emit("typing", { username: name, isTyping: val.length > 0 });
  };

  return (
    <div style={{ padding: 20 }}>
      {!joined ? (
        <div>
          <input
            placeholder="Your Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
          <button onClick={join}>Join Chat</button>
        </div>
      ) : (
        <div>
          <div
            style={{
              height: 300,
              overflow: "auto",
              border: "1px solid #ddd",
              padding: 10,
            }}
          >
            {messages.map((m, index) => (
              <div key={index}>
                <b>{m.user}</b>: {m.text} <small>({m.time})</small>
              </div>
            ))}
          </div>

          <div>
            {Object.keys(typingUsers).length > 0 && (
              <div>
                {Object.keys(typingUsers).join(", ")} typing...
              </div>
            )}
            <form onSubmit={send}>
              <input
                value={text}
                onChange={(e) => handleTyping(e.target.value)}
                placeholder="Enter message"
              />
              <button type="submit">Send</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;