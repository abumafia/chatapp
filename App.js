import React, { useState, useEffect } from "react";
import { io } from "socket.io-client";

const socket = io("http://localhost:5000"); // Backend serverga ulanish

function App() {
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);

  useEffect(() => {
    socket.on("receiveMessage", (data) => {
      setMessages((prev) => [...prev, data]);
    });

    return () => socket.off("receiveMessage");
  }, []);

  const sendMessage = () => {
    if (message.trim()) {
      socket.emit("sendMessage", message);
      setMessage("");
    }
  };

  return (
    <div style={{ textAlign: "center", padding: "20px" }}>
      <h2>💬 Real-time Chat</h2>
      <div style={{ height: "300px", overflowY: "auto", border: "1px solid #ccc", padding: "10px" }}>
        {messages.map((msg, index) => (
          <div key={index} style={{ background: "#f1f1f1", margin: "5px", padding: "10px", borderRadius: "5px" }}>
            {msg}
          </div>
        ))}
      </div>
      <input
        type="text"
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        placeholder="Xabar yozing..."
        style={{ padding: "10px", width: "80%", marginTop: "10px" }}
      />
      <button onClick={sendMessage} style={{ padding: "10px", marginLeft: "5px" }}>📤 Yuborish</button>
    </div>
  );
}

export default App;

import React, { useState, useEffect } from "react";
import { io } from "socket.io-client";

const socket = io("http://localhost:5000");

function App() {
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);
  const [room, setRoom] = useState("General"); // Default guruh
  const [darkMode, setDarkMode] = useState(false);

  useEffect(() => {
    socket.emit("joinRoom", room);

    socket.on("receiveMessage", (data) => {
      setMessages((prev) => [...prev, data]);
    });

    return () => socket.off("receiveMessage");
  }, [room]);

  const sendMessage = () => {
    if (message.trim()) {
      socket.emit("sendMessage", { room, message });
      setMessage("");
    }
  };

  return (
    <div style={{
      textAlign: "center",
      padding: "20px",
      background: darkMode ? "#222" : "#fff",
      color: darkMode ? "#fff" : "#000",
      height: "100vh"
    }}>
      <h2>💬 Guruh Chat</h2>

      {/* Guruhlar */}
      <select value={room} onChange={(e) => setRoom(e.target.value)} style={{ padding: "10px", marginBottom: "10px" }}>
        <option value="General">General</option>
        <option value="Tech">Tech</option>
        <option value="Sports">Sports</option>
      </select>

      {/* Xabarlar */}
      <div style={{
        height: "300px",
        overflowY: "auto",
        border: "1px solid #ccc",
        padding: "10px",
        background: darkMode ? "#444" : "#f1f1f1"
      }}>
        {messages.map((msg, index) => (
          <div key={index} style={{ margin: "5px", padding: "10px", borderRadius: "5px", background: darkMode ? "#555" : "#fff" }}>
            <strong>{msg.room}:</strong> {msg.message}
          </div>
        ))}
      </div>

      {/* Xabar yozish */}
      <input
        type="text"
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        placeholder="Xabar yozing..."
        style={{ padding: "10px", width: "60%", marginTop: "10px" }}
      />
      <button onClick={sendMessage} style={{ padding: "10px", marginLeft: "5px" }}>📤 Yuborish</button>

      {/* Dark Mode */}
      <div>
        <button onClick={() => setDarkMode(!darkMode)} style={{ padding: "10px", marginTop: "10px" }}>
          {darkMode ? "🌞 Light Mode" : "🌙 Dark Mode"}
        </button>
      </div>
    </div>
  );
}

export default App;

import React, { useState, useEffect } from "react";
import { io } from "socket.io-client";

const socket = io("http://localhost:5000");

function App() {
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);
  const [room, setRoom] = useState("General"); // Default guruh
  const [darkMode, setDarkMode] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);

  useEffect(() => {
    socket.emit("joinRoom", room);

    socket.on("receiveMessage", (data) => {
      setMessages((prev) => [...prev, data]);
    });

    socket.on("receiveReaction", (data) => {
      alert(`🔥 ${data.reaction} reaksiyasi olindi!`);
    });

    return () => {
      socket.off("receiveMessage");
      socket.off("receiveReaction");
    };
  }, [room]);

  const sendMessage = () => {
    if (message.trim()) {
      socket.emit("sendMessage", { room, message, type: "text" });
      setMessage("");
    }
  };

  const sendReaction = (emoji) => {
    socket.emit("sendReaction", { room, reaction: emoji });
  };

  const handleFileUpload = () => {
    if (selectedFile) {
      const reader = new FileReader();
      reader.onloadend = () => {
        socket.emit("sendMessage", { room, message: reader.result, type: selectedFile.type.includes("image") ? "image" : "video" });
      };
      reader.readAsDataURL(selectedFile);
      setSelectedFile(null);
    }
  };

  return (
    <div style={{
      textAlign: "center",
      padding: "20px",
      background: darkMode ? "#222" : "#fff",
      color: darkMode ? "#fff" : "#000",
      height: "100vh"
    }}>
      <h2>💬 Guruh Chat</h2>

      {/* Guruhlar */}
      <select value={room} onChange={(e) => setRoom(e.target.value)} style={{ padding: "10px", marginBottom: "10px" }}>
        <option value="General">General</option>
        <option value="Tech">Tech</option>
        <option value="Sports">Sports</option>
      </select>

      {/* Xabarlar */}
      <div style={{
        height: "300px",
        overflowY: "auto",
        border: "1px solid #ccc",
        padding: "10px",
        background: darkMode ? "#444" : "#f1f1f1"
      }}>
        {messages.map((msg, index) => (
          <div key={index} style={{ margin: "5px", padding: "10px", borderRadius: "5px", background: darkMode ? "#555" : "#fff" }}>
            <strong>{msg.room}:</strong> 
            {msg.type === "text" && <span> {msg.message}</span>}
            {msg.type === "image" && <img src={msg.message} alt="img" style={{ width: "100px", borderRadius: "5px" }} />}
            {msg.type === "video" && <video src={msg.message} controls style={{ width: "100px", borderRadius: "5px" }} />}
          </div>
        ))}
      </div>

      {/* Xabar yozish */}
      <input
        type="text"
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        placeholder="Xabar yozing..."
        style={{ padding: "10px", width: "60%", marginTop: "10px" }}
      />
      <button onClick={sendMessage} style={{ padding: "10px", marginLeft: "5px" }}>📤 Yuborish</button>

      {/* Rasm va video yuklash */}
      <input type="file" onChange={(e) => setSelectedFile(e.target.files[0])} style={{ marginTop: "10px" }} />
      <button onClick={handleFileUpload} style={{ padding: "10px", marginLeft: "5px" }}>📷 Yuborish</button>

      {/* Emoji va reaksiyalar */}
      <div>
        <button onClick={() => sendReaction("🔥")} style={{ padding: "10px", margin: "5px" }}>🔥</button>
        <button onClick={() => sendReaction("😂")} style={{ padding: "10px", margin: "5px" }}>😂</button>
        <button onClick={() => sendReaction("❤️")} style={{ padding: "10px", margin: "5px" }}>❤️</button>
      </div>

      {/* Dark Mode */}
      <div>
        <button onClick={() => setDarkMode(!darkMode)} style={{ padding: "10px", marginTop: "10px" }}>
          {darkMode ? "🌞 Light Mode" : "🌙 Dark Mode"}
        </button>
      </div>
    </div>
  );
}

export default App;
