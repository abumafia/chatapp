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

import React, { useState, useEffect } from "react";
import { io } from "socket.io-client";

const socket = io("http://localhost:5000");

function App() {
  const [username, setUsername] = useState("");
  const [avatar, setAvatar] = useState("");
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);
  const [room, setRoom] = useState("General");
  const [darkMode, setDarkMode] = useState(false);

  useEffect(() => {
    socket.emit("joinRoom", room);

    socket.on("receiveMessage", (msg) => {
      setMessages((prev) => [...prev, msg]);
    });

    socket.on("messageDeleted", (id) => {
      setMessages((prev) => prev.filter((msg) => msg.id !== id));
    });

    return () => {
      socket.off("receiveMessage");
      socket.off("messageDeleted");
    };
  }, [room]);

  const sendMessage = () => {
    if (message.trim()) {
      socket.emit("sendMessage", {
        room,
        message,
        type: "text",
      });
      setMessage("");
    }
  };

  const deleteMessage = (id) => {
    socket.emit("deleteMessage", { room, messageId: id });
  };

  const updateProfile = () => {
    if (username.trim()) {
      socket.emit("updateProfile", { username, avatar });
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
      <h2>💬 Chat</h2>

      {/* Profil sozlamalari */}
      <div>
        <input
          type="text"
          placeholder="Ismingizni kiriting..."
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          style={{ padding: "10px", marginBottom: "10px" }}
        />
        <input
          type="text"
          placeholder="Avatar URL..."
          value={avatar}
          onChange={(e) => setAvatar(e.target.value)}
          style={{ padding: "10px", marginLeft: "5px" }}
        />
        <button onClick={updateProfile} style={{ padding: "10px", marginLeft: "5px" }}>🔄 Yangilash</button>
      </div>

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
          <div key={index} style={{
            margin: "5px",
            padding: "10px",
            borderRadius: "5px",
            background: darkMode ? "#555" : "#fff",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between"
          }}>
            <div style={{ display: "flex", alignItems: "center" }}>
              {msg.user.avatar && <img src={msg.user.avatar} alt="Avatar" style={{ width: "30px", borderRadius: "50%", marginRight: "10px" }} />}
              <strong>{msg.user.username}:</strong> <span> {msg.message}</span>
            </div>
            <button onClick={() => deleteMessage(msg.id)} style={{ padding: "5px", background: "red", color: "#fff", border: "none", borderRadius: "5px" }}>🗑</button>
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
  const [username, setUsername] = useState("");
  const [avatar, setAvatar] = useState("");
  const [message, setMessage] = useState("");
  const [audioBlob, setAudioBlob] = useState(null);
  const [messages, setMessages] = useState([]);
  const [room, setRoom] = useState("General");
  const [darkMode, setDarkMode] = useState(false);
  const [channels, setChannels] = useState([]);
  const [newChannel, setNewChannel] = useState("");

  useEffect(() => {
    socket.emit("joinRoom", room);

    socket.on("receiveMessage", (msg) => {
      setMessages((prev) => [...prev, msg]);
    });

    socket.on("messageDeleted", (id) => {
      setMessages((prev) => prev.filter((msg) => msg.id !== id));
    });

    socket.on("channelCreated", ({ channelName }) => {
      setChannels((prev) => [...prev, channelName]);
    });

    return () => {
      socket.off("receiveMessage");
      socket.off("messageDeleted");
      socket.off("channelCreated");
    };
  }, [room]);

  const sendMessage = () => {
    if (message.trim() || audioBlob) {
      socket.emit("sendMessage", {
        room,
        message,
        type: audioBlob ? "audio" : "text",
        audio: audioBlob,
      });
      setMessage("");
      setAudioBlob(null);
    }
  };

  const deleteMessage = (id) => {
    socket.emit("deleteMessage", { room, messageId: id });
  };

  const updateProfile = () => {
    if (username.trim()) {
      socket.emit("updateProfile", { username, avatar });
    }
  };

  const createChannel = () => {
    if (newChannel.trim()) {
      socket.emit("createChannel", { channelName: newChannel, admin: username });
      setNewChannel("");
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
      <h2>💬 Chat</h2>

      {/* Profil sozlamalari */}
      <div>
        <input type="text" placeholder="Ismingiz" value={username} onChange={(e) => setUsername(e.target.value)} />
        <input type="text" placeholder="Avatar URL" value={avatar} onChange={(e) => setAvatar(e.target.value)} />
        <button onClick={updateProfile}>🔄 Yangilash</button>
      </div>

      {/* Kanallar */}
      <div>
        <h3>📢 Kanallar</h3>
        {channels.map((channel, index) => (
          <div key={index}>{channel}</div>
        ))}
        <input type="text" placeholder="Yangi kanal nomi" value={newChannel} onChange={(e) => setNewChannel(e.target.value)} />
        <button onClick={createChannel}>➕ Kanal yaratish</button>
      </div>

      {/* Xabarlar */}
      <div style={{ height: "300px", overflowY: "auto", background: darkMode ? "#444" : "#f1f1f1" }}>
        {messages.map((msg, index) => (
          <div key={index} style={{ margin: "5px", padding: "10px", borderRadius: "5px", background: darkMode ? "#555" : "#fff" }}>
            <strong>{msg.user.username}:</strong> {msg.type === "audio" ? "🎤 Audio xabar" : msg.message}
            {msg.type === "audio" && <audio controls src={msg.audio}></audio>}
            <button onClick={() => deleteMessage(msg.id)}>🗑</button>
          </div>
        ))}
      </div>

      {/* Xabar yozish */}
      <input type="text" value={message} onChange={(e) => setMessage(e.target.value)} placeholder="Xabar yozing..." />
      <button onClick={sendMessage}>📤 Yuborish</button>

      {/* Audio yozish */}
      <button onClick={() => setAudioBlob("sample-audio-url.mp3")}>🎙 Ovozni yozish</button>

      {/* Dark Mode */}
      <button onClick={() => setDarkMode(!darkMode)}>{darkMode ? "🌞 Light Mode" : "🌙 Dark Mode"}</button>
    </div>
  );
}

export default App;

import React, { useState, useEffect } from "react";
import { io } from "socket.io-client";

const socket = io("http://localhost:5000");

function App() {
  const [username, setUsername] = useState("");
  const [avatar, setAvatar] = useState("");
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);
  const [room, setRoom] = useState("General");
  const [darkMode, setDarkMode] = useState(false);
  const [editingMessageId, setEditingMessageId] = useState(null);
  const [newText, setNewText] = useState("");
  const [selectedFile, setSelectedFile] = useState(null);

  useEffect(() => {
    socket.emit("joinRoom", room);

    socket.on("receiveMessage", (msg) => {
      setMessages((prev) => [...prev, msg]);
    });

    socket.on("messageDeleted", (id) => {
      setMessages((prev) => prev.filter((msg) => msg.id !== id));
    });

    socket.on("messageEdited", ({ messageId, newText }) => {
      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === messageId ? { ...msg, message: newText } : msg
        )
      );
    });

    return () => {
      socket.off("receiveMessage");
      socket.off("messageDeleted");
      socket.off("messageEdited");
    };
  }, [room]);

  const sendMessage = () => {
    if (message.trim() || selectedFile) {
      const fileData = selectedFile ? URL.createObjectURL(selectedFile) : null;
      socket.emit("sendMessage", {
        room,
        message,
        type: selectedFile ? "file" : "text",
        media: fileData,
      });
      setMessage("");
      setSelectedFile(null);
    }
  };

  const deleteMessage = (id) => {
    socket.emit("deleteMessage", { room, messageId: id });
  };

  const startEditing = (id, text) => {
    setEditingMessageId(id);
    setNewText(text);
  };

  const editMessage = () => {
    socket.emit("editMessage", {
      room,
      messageId: editingMessageId,
      newText,
    });
    setEditingMessageId(null);
    setNewText("");
  };

  return (
    <div
      style={{
        textAlign: "center",
        padding: "20px",
        background: darkMode ? "#222" : "#fff",
        color: darkMode ? "#fff" : "#000",
        height: "100vh",
      }}
    >
      <h2>💬 Chat</h2>

      <div>
        <input
          type="text"
          placeholder="Ismingiz"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />
        <button onClick={() => socket.emit("updateProfile", { username })}>
          🔄 Yangilash
        </button>
      </div>

      <div style={{ height: "300px", overflowY: "auto", background: "#f1f1f1" }}>
        {messages.map((msg) => (
          <div key={msg.id} style={{ margin: "5px", padding: "10px", background: "#fff" }}>
            <strong>{msg.user.username}:</strong>{" "}
            {msg.type === "file" ? (
              <a href={msg.media} target="_blank" rel="noopener noreferrer">
                📂 Fayl
              </a>
            ) : (
              msg.message
            )}
            <button onClick={() => deleteMessage(msg.id)}>🗑</button>
            <button onClick={() => startEditing(msg.id, msg.message)}>✏</button>
          </div>
        ))}
      </div>

      {editingMessageId ? (
        <div>
          <input
            type="text"
            value={newText}
            onChange={(e) => setNewText(e.target.value)}
          />
          <button onClick={editMessage}>✅ Saqlash</button>
        </div>
      ) : (
        <div>
          <input
            type="text"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Xabar yozing..."
          />
          <input type="file" onChange={(e) => setSelectedFile(e.target.files[0])} />
          <button onClick={sendMessage}>📤 Yuborish</button>
        </div>
      )}

      <button onClick={() => setDarkMode(!darkMode)}>
        {darkMode ? "🌞 Light Mode" : "🌙 Dark Mode"}
      </button>
    </div>
  );
}

export default App;

import React, { useState, useEffect } from "react";
import { io } from "socket.io-client";

const socket = io("http://localhost:5000");

function App() {
  const [username, setUsername] = useState("");
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);
  const [room, setRoom] = useState("General");
  const [darkMode, setDarkMode] = useState(false);
  const [users, setUsers] = useState([]);

  useEffect(() => {
    socket.emit("joinRoom", room);

    socket.on("loadMessages", (msgs) => {
      setMessages(msgs);
    });

    socket.on("receiveMessage", (msg) => {
      setMessages((prev) => [...prev, msg]);
    });

    socket.on("messageDeleted", (id) => {
      setMessages((prev) => prev.filter((msg) => msg.id !== id));
    });

    socket.on("updateUsers", (onlineUsers) => {
      setUsers(onlineUsers);
    });

    return () => {
      socket.off("loadMessages");
      socket.off("receiveMessage");
      socket.off("messageDeleted");
      socket.off("updateUsers");
    };
  }, [room]);

  const sendMessage = () => {
    if (message.trim()) {
      socket.emit("sendMessage", { room, message, type: "text", media: null });
      setMessage("");
    }
  };

  return (
    <div
      style={{
        textAlign: "center",
        padding: "20px",
        background: darkMode ? "#222" : "#fff",
        color: darkMode ? "#fff" : "#000",
        height: "100vh",
      }}
    >
      <h2>💬 Chat</h2>

      <div>
        <input
          type="text"
          placeholder="Ismingiz"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />
        <button onClick={() => socket.emit("updateProfile", { username })}>
          🔄 Yangilash
        </button>
      </div>

      <h3>🟢 Onlayn foydalanuvchilar:</h3>
      <ul>
        {users.map((user, index) => (
          <li key={index}>
            {user.username} ({user.status === "online" ? "🟢 Online" : "🔴 Offline"})
          </li>
        ))}
      </ul>

      <div style={{ height: "300px", overflowY: "auto", background: "#f1f1f1" }}>
        {messages.map((msg) => (
          <div key={msg.id} style={{ margin: "5px", padding: "10px", background: "#fff" }}>
            <strong>{msg.user.username}:</strong> {msg.message}
          </div>
        ))}
      </div>

      <div>
        <input
          type="text"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Xabar yozing..."
        />
        <button onClick={sendMessage}>📤 Yuborish</button>
      </div>

      <button onClick={() => setDarkMode(!darkMode)}>
        {darkMode ? "🌞 Light Mode" : "🌙 Dark Mode"}
      </button>
    </div>
  );
}

export default App;

import React, { useState, useEffect } from "react";
import { io } from "socket.io-client";

const socket = io("http://localhost:5000");

function App() {
  const [username, setUsername] = useState("");
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);
  const [group, setGroup] = useState("General");
  const [darkMode, setDarkMode] = useState(false);
  const [users, setUsers] = useState([]);
  const [groups, setGroups] = useState(["General"]);
  const [newGroup, setNewGroup] = useState("");

  useEffect(() => {
    socket.emit("joinGroup", group);

    socket.on("loadMessages", (msgs) => {
      setMessages(msgs);
    });

    socket.on("receiveMessage", (msg) => {
      setMessages((prev) => [...prev, msg]);
    });

    socket.on("messageDeleted", (id) => {
      setMessages((prev) => prev.filter((msg) => msg.id !== id));
    });

    socket.on("updateUsers", (onlineUsers) => {
      setUsers(onlineUsers);
    });

    socket.on("updateGroups", (groupList) => {
      setGroups(groupList);
    });

    return () => {
      socket.off("loadMessages");
      socket.off("receiveMessage");
      socket.off("messageDeleted");
      socket.off("updateUsers");
      socket.off("updateGroups");
    };
  }, [group]);

  const sendMessage = () => {
    if (message.trim()) {
      socket.emit("sendMessage", { group, message, type: "text", media: null });
      setMessage("");
    }
  };

  const createGroup = () => {
    if (newGroup.trim() && !groups.includes(newGroup)) {
      setGroups([...groups, newGroup]);
      socket.emit("joinGroup", newGroup);
      setGroup(newGroup);
      setNewGroup("");
    }
  };

  return (
    <div
      style={{
        textAlign: "center",
        padding: "20px",
        background: darkMode ? "#222" : "#fff",
        color: darkMode ? "#fff" : "#000",
        height: "100vh",
      }}
    >
      <h2>💬 Chat</h2>

      <div>
        <input
          type="text"
          placeholder="Ismingiz"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />
        <button onClick={() => socket.emit("updateProfile", { username })}>
          🔄 Yangilash
        </button>
      </div>

      <h3>🟢 Onlayn foydalanuvchilar:</h3>
      <ul>
        {users.map((user, index) => (
          <li key={index}>
            {user.username} ({user.status === "online" ? "🟢 Online" : "🔴 Offline"})
          </li>
        ))}
      </ul>

      <h3>📂 Guruhlar:</h3>
      <ul>
        {groups.map((grp, index) => (
          <li key={index}>
            <button onClick={() => setGroup(grp)}>{grp}</button>
          </li>
        ))}
      </ul>

      <input
        type="text"
        placeholder="Yangi guruh nomi..."
        value={newGroup}
        onChange={(e) => setNewGroup(e.target.value)}
      />
      <button onClick={createGroup}>➕ Guruh yaratish</button>

      <div style={{ height: "300px", overflowY: "auto", background: "#f1f1f1" }}>
        {messages.map((msg) => (
          <div key={msg.id} style={{ margin: "5px", padding: "10px", background: "#fff" }}>
            <strong>{msg.user.username}:</strong> {msg.message}
          </div>
        ))}
      </div>

      <div>
        <input
          type="text"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Xabar yozing..."
        />
        <button onClick={sendMessage}>📤 Yuborish</button>
      </div>

      <button onClick={() => setDarkMode(!darkMode)}>
        {darkMode ? "🌞 Light Mode" : "🌙 Dark Mode"}
      </button>
    </div>
  );
}

export default App;

import React, { useState, useEffect } from "react";
import { io } from "socket.io-client";

const socket = io("http://localhost:5000");

function App() {
  const [username, setUsername] = useState("");
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);
  const [group, setGroup] = useState("General");
  const [darkMode, setDarkMode] = useState(false);
  const [users, setUsers] = useState([]);
  const [groups, setGroups] = useState(["General"]);
  const [channels, setChannels] = useState([]);
  const [newChannel, setNewChannel] = useState("");

  useEffect(() => {
    socket.emit("joinChannel", group);

    socket.on("loadChannelMessages", (msgs) => {
      setMessages(msgs);
    });

    socket.on("receiveMessage", (msg) => {
      setMessages((prev) => [...prev, msg]);
    });

    socket.on("updateUsers", (onlineUsers) => {
      setUsers(onlineUsers);
    });

    socket.on("updateChannels", (channelList) => {
      setChannels(channelList);
    });

    return () => {
      socket.off("loadChannelMessages");
      socket.off("receiveMessage");
      socket.off("updateUsers");
      socket.off("updateChannels");
    };
  }, [group]);

  const sendMessage = () => {
    if (message.trim()) {
      socket.emit("sendMessage", { group, message, type: "text", media: null });
      setMessage("");
    }
  };

  const createChannel = () => {
    if (newChannel.trim() && !channels.includes(newChannel)) {
      socket.emit("createChannel", { name: newChannel, admin: username });
      setNewChannel("");
    }
  };

  return (
    <div
      style={{
        textAlign: "center",
        padding: "20px",
        background: darkMode ? "#222" : "#fff",
        color: darkMode ? "#fff" : "#000",
        height: "100vh",
      }}
    >
      <h2>💬 Chat</h2>

      <div>
        <input
          type="text"
          placeholder="Ismingiz"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />
        <button onClick={() => socket.emit("updateProfile", { username })}>
          🔄 Yangilash
        </button>
      </div>

      <h3>📂 Kanallar:</h3>
      <ul>
        {channels.map((ch, index) => (
          <li key={index}>
            <button onClick={() => setGroup(ch)}>{ch}</button>
          </li>
        ))}
      </ul>

      <input
        type="text"
        placeholder="Yangi kanal nomi..."
        value={newChannel}
        onChange={(e) => setNewChannel(e.target.value)}
      />
      <button onClick={createChannel}>➕ Kanal yaratish</button>

      <div style={{ height: "300px", overflowY: "auto", background: "#f1f1f1" }}>
        {messages.map((msg) => (
          <div key={msg.id} style={{ margin: "5px", padding: "10px", background: "#fff" }}>
            <strong>{msg.user.username}:</strong> {msg.message}
          </div>
        ))}
      </div>

      <div>
        <input
          type="text"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Xabar yozing..."
        />
        <button onClick={sendMessage}>📤 Yuborish</button>
      </div>

      <button onClick={() => setDarkMode(!darkMode)}>
        {darkMode ? "🌞 Light Mode" : "🌙 Dark Mode"}
      </button>
    </div>
  );
}

export default App;

import React, { useState, useEffect } from "react";
import { io } from "socket.io-client";

const socket = io("http://localhost:5000");

function App() {
  const [username, setUsername] = useState("");
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);
  const [group, setGroup] = useState("General");
  const [darkMode, setDarkMode] = useState(false);
  const [users, setUsers] = useState([]);
  const [channels, setChannels] = useState([]);
  const [newChannel, setNewChannel] = useState("");

  useEffect(() => {
    socket.emit("joinChannel", { channel: group, username });

    socket.on("loadChannelMessages", (msgs) => setMessages(msgs));
    socket.on("receiveMessage", (msg) => setMessages((prev) => [...prev, msg]));
    socket.on("updateUsers", (onlineUsers) => setUsers(onlineUsers));
    socket.on("updateChannels", (channelList) => setChannels(channelList));
    socket.on("updateMessages", (msgs) => setMessages(msgs));

    return () => {
      socket.off("loadChannelMessages");
      socket.off("receiveMessage");
      socket.off("updateUsers");
      socket.off("updateChannels");
      socket.off("updateMessages");
    };
  }, [group]);

  const sendMessage = () => {
    if (message.trim()) {
      socket.emit("sendMessage", { group, message, type: "text", media: null });
      setMessage("");
    }
  };

  const createChannel = () => {
    if (newChannel.trim() && !channels.includes(newChannel)) {
      socket.emit("createChannel", { name: newChannel, admin: username });
      setNewChannel("");
    }
  };

  const removeUser = (channel, user) => {
    socket.emit("removeUser", { channel, username: user });
  };

  const deleteMessage = (messageId) => {
    socket.emit("deleteMessage", { group, messageId });
  };

  return (
    <div
      style={{
        textAlign: "center",
        padding: "20px",
        background: darkMode ? "#222" : "#fff",
        color: darkMode ? "#fff" : "#000",
        height: "100vh",
      }}
    >
      <h2>💬 Chat</h2>

      <div>
        <input
          type="text"
          placeholder="Ismingiz"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />
        <button onClick={() => socket.emit("updateProfile", { username })}>
          🔄 Yangilash
        </button>
      </div>

      <h3>📂 Kanallar:</h3>
      <ul>
        {channels.map((ch, index) => (
          <li key={index}>
            <button onClick={() => setGroup(ch)}>{ch}</button>
          </li>
        ))}
      </ul>

      <input
        type="text"
        placeholder="Yangi kanal nomi..."
        value={newChannel}
        onChange={(e) => setNewChannel(e.target.value)}
      />
      <button onClick={createChannel}>➕ Kanal yaratish</button>

      <div style={{ height: "300px", overflowY: "auto", background: "#f1f1f1" }}>
        {messages.map((msg) => (
          <div key={msg.id} style={{ margin: "5px", padding: "10px", background: "#fff" }}>
            <strong>{msg.user.username}:</strong> {msg.message}
            <button onClick={() => deleteMessage(msg.id)}>❌</button>
          </div>
        ))}
      </div>

      <div>
        <input
          type="text"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Xabar yozing..."
        />
        <button onClick={sendMessage}>📤 Yuborish</button>
      </div>

      <button onClick={() => setDarkMode(!darkMode)}>
        {darkMode ? "🌞 Light Mode" : "🌙 Dark Mode"}
      </button>
    </div>
  );
}

export default App;

import React, { useState, useEffect } from "react";
import { io } from "socket.io-client";
import axios from "axios";

const socket = io("http://localhost:5000");

function App() {
  const [username, setUsername] = useState("");
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);
  const [file, setFile] = useState(null);

  useEffect(() => {
    socket.on("receiveMessage", (msg) => setMessages((prev) => [...prev, msg]));

    return () => {
      socket.off("receiveMessage");
    };
  }, []);

  const sendMessage = async () => {
    let fileUrl = null;

    if (file) {
      const formData = new FormData();
      formData.append("file", file);

      try {
        const res = await axios.post("http://localhost:5000/upload", formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        fileUrl = res.data.url;
      } catch (error) {
        console.error("Fayl yuklashda xatolik", error);
      }
    }

    socket.emit("sendMessage", {
      group: "General",
      message,
      type: file ? "media" : "text",
      media: fileUrl,
    });

    setMessage("");
    setFile(null);
  };

  return (
    <div style={{ textAlign: "center", padding: "20px" }}>
      <h2>💬 Chat</h2>

      <input
        type="text"
        placeholder="Ismingiz"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
      />
      <button onClick={() => socket.emit("updateProfile", { username })}>🔄 Profilni yangilash</button>

      <div style={{ height: "300px", overflowY: "auto", background: "#f1f1f1" }}>
        {messages.map((msg) => (
          <div key={msg.id} style={{ margin: "5px", padding: "10px", background: "#fff" }}>
            <strong>{msg.user.username}:</strong> {msg.message}
            {msg.media && (
              msg.media.endsWith(".mp4") ? (
                <video src={`http://localhost:5000${msg.media}`} controls width="200px" />
              ) : (
                <img src={`http://localhost:5000${msg.media}`} alt="Media" width="200px" />
              )
            )}
          </div>
        ))}
      </div>

      <input type="text" value={message} onChange={(e) => setMessage(e.target.value)} placeholder="Xabar yozing..." />
      <input type="file" onChange={(e) => setFile(e.target.files[0])} />
      <button onClick={sendMessage}>📤 Yuborish</button>
    </div>
  );
}

export default App;

import React, { useState, useEffect } from "react";
import { io } from "socket.io-client";
import axios from "axios";

const socket = io("http://localhost:5000");

function App() {
  const [username, setUsername] = useState("");
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);
  const [file, setFile] = useState(null);
  const [editId, setEditId] = useState(null);
  const [editText, setEditText] = useState("");

  useEffect(() => {
    socket.on("receiveMessage", (msg) => setMessages((prev) => [...prev, msg]));
    socket.on("deleteMessage", (id) => setMessages((prev) => prev.filter((msg) => msg.id !== id)));
    socket.on("editMessage", (updatedMsg) =>
      setMessages((prev) =>
        prev.map((msg) => (msg.id === updatedMsg.id ? updatedMsg : msg))
      )
    );

    return () => {
      socket.off("receiveMessage");
      socket.off("deleteMessage");
      socket.off("editMessage");
    };
  }, []);

  const sendMessage = async () => {
    let fileUrl = null;

    if (file) {
      const formData = new FormData();
      formData.append("file", file);

      try {
        const res = await axios.post("http://localhost:5000/upload", formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        fileUrl = res.data.url;
      } catch (error) {
        console.error("Fayl yuklashda xatolik", error);
      }
    }

    socket.emit("sendMessage", {
      group: "General",
      message,
      type: file ? "media" : "text",
      media: fileUrl,
    });

    setMessage("");
    setFile(null);
  };

  const deleteMessage = (id) => {
    socket.emit("deleteMessage", { group: "General", id });
  };

  const editMessage = () => {
    if (editId && editText) {
      socket.emit("editMessage", { group: "General", id: editId, newMessage: editText });
      setEditId(null);
      setEditText("");
    }
  };

  return (
    <div style={{ textAlign: "center", padding: "20px" }}>
      <h2>💬 Chat</h2>

      <input
        type="text"
        placeholder="Ismingiz"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
      />
      <button onClick={() => socket.emit("updateProfile", { username })}>🔄 Profilni yangilash</button>

      <div style={{ height: "300px", overflowY: "auto", background: "#f1f1f1" }}>
        {messages.map((msg) => (
          <div key={msg.id} style={{ margin: "5px", padding: "10px", background: "#fff" }}>
            <strong>{msg.user.username}:</strong> {msg.message}
            {msg.media && (
              msg.media.endsWith(".mp4") ? (
                <video src={`http://localhost:5000${msg.media}`} controls width="200px" />
              ) : (
                <img src={`http://localhost:5000${msg.media}`} alt="Media" width="200px" />
              )
            )}
            <button onClick={() => deleteMessage(msg.id)}>🗑️ O‘chirish</button>
            <button onClick={() => { setEditId(msg.id); setEditText(msg.message); }}>✏️ Tahrirlash</button>
          </div>
        ))}
      </div>

      {editId ? (
        <div>
          <input type="text" value={editText} onChange={(e) => setEditText(e.target.value)} />
          <button onClick={editMessage}>✅ Saqlash</button>
        </div>
      ) : (
        <>
          <input type="text" value={message} onChange={(e) => setMessage(e.target.value)} placeholder="Xabar yozing..." />
          <input type="file" onChange={(e) => setFile(e.target.files[0])} />
          <button onClick={sendMessage}>📤 Yuborish</button>
        </>
      )}
    </div>
  );
}

export default App;
