const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*", // Har qanday frontend kirishi mumkin
  },
});

app.use(cors());
app.use(express.json());

io.on("connection", (socket) => {
  console.log(`Foydalanuvchi ulandi: ${socket.id}`);

  socket.on("sendMessage", (data) => {
    io.emit("receiveMessage", data); // Barcha foydalanuvchilarga jo‘natish
  });

  socket.on("disconnect", () => {
    console.log(`Foydalanuvchi chiqdi: ${socket.id}`);
  });
});

server.listen(5000, () => {
  console.log("🔥 Server 5000-portda ishlamoqda...");
});
const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*",
  },
});

app.use(cors());
app.use(express.json());

const rooms = {}; // Guruhlar ro‘yxati

io.on("connection", (socket) => {
  console.log(`Foydalanuvchi ulandi: ${socket.id}`);

  // Guruhga qo‘shilish
  socket.on("joinRoom", (room) => {
    socket.join(room);
    if (!rooms[room]) rooms[room] = [];
    console.log(`${socket.id} ${room} guruhiga qo‘shildi`);
  });

  // Xabar yuborish
  socket.on("sendMessage", ({ room, message }) => {
    io.to(room).emit("receiveMessage", { message, room });
  });

  socket.on("disconnect", () => {
    console.log(`Foydalanuvchi chiqdi: ${socket.id}`);
  });
});

server.listen(5000, () => {
  console.log("🔥 Server 5000-portda ishlamoqda...");
});

const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*",
  },
});

app.use(cors());
app.use(express.json());

const rooms = {}; // Guruhlar ro‘yxati

io.on("connection", (socket) => {
  console.log(`Foydalanuvchi ulandi: ${socket.id}`);

  // Guruhga qo‘shilish
  socket.on("joinRoom", (room) => {
    socket.join(room);
    if (!rooms[room]) rooms[room] = [];
    console.log(`${socket.id} ${room} guruhiga qo‘shildi`);
  });

  // Xabar yuborish (Matn, Emoji, Rasm, Video)
  socket.on("sendMessage", ({ room, message, type }) => {
    io.to(room).emit("receiveMessage", { message, room, type });
  });

  // Reaksiya yuborish
  socket.on("sendReaction", ({ room, reaction }) => {
    io.to(room).emit("receiveReaction", { reaction, room });
  });

  socket.on("disconnect", () => {
    console.log(`Foydalanuvchi chiqdi: ${socket.id}`);
  });
});

server.listen(5000, () => {
  console.log("🔥 Server 5000-portda ishlamoqda...");
});

const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*",
  },
});

app.use(cors());
app.use(express.json());

const users = {}; // Foydalanuvchilar (socket.id => profil)
const messages = {}; // Xabarlar ro‘yxati (guruh bo‘yicha)

io.on("connection", (socket) => {
  console.log(`🔗 Foydalanuvchi ulandi: ${socket.id}`);

  // Profil ma'lumotlarini saqlash
  socket.on("updateProfile", (profile) => {
    users[socket.id] = profile;
    console.log(`✅ Profil yangilandi: ${profile.username}`);
  });

  // Guruhga qo‘shilish
  socket.on("joinRoom", (room) => {
    socket.join(room);
    if (!messages[room]) messages[room] = [];
    console.log(`📢 ${socket.id} ${room} guruhiga qo‘shildi`);
  });

  // Xabar yuborish
  socket.on("sendMessage", ({ room, message, type }) => {
    const user = users[socket.id] || { username: "Anonim", avatar: "" };
    const msgData = {
      id: Date.now(),
      user,
      message,
      type,
    };
    messages[room].push(msgData);
    io.to(room).emit("receiveMessage", msgData);
  });

  // Xabarni o‘chirish
  socket.on("deleteMessage", ({ room, messageId }) => {
    messages[room] = messages[room].filter((msg) => msg.id !== messageId);
    io.to(room).emit("messageDeleted", messageId);
  });

  socket.on("disconnect", () => {
    console.log(`❌ Foydalanuvchi chiqdi: ${socket.id}`);
    delete users[socket.id];
  });
});

server.listen(5000, () => {
  console.log("🔥 Server 5000-portda ishlamoqda...");
});

const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*",
  },
});

app.use(cors());
app.use(express.json());

const users = {}; // Foydalanuvchilar (socket.id => profil)
const messages = {}; // Xabarlar (guruh yoki kanal bo‘yicha)
const channels = {}; // Kanallar (adminlar bilan)

io.on("connection", (socket) => {
  console.log(`🔗 Foydalanuvchi ulandi: ${socket.id}`);

  // Profilni saqlash
  socket.on("updateProfile", (profile) => {
    users[socket.id] = profile;
    console.log(`✅ Profil yangilandi: ${profile.username}`);
  });

  // Guruh yoki kanallarga qo‘shilish
  socket.on("joinRoom", (room) => {
    socket.join(room);
    if (!messages[room]) messages[room] = [];
    console.log(`📢 ${socket.id} ${room} guruhiga qo‘shildi`);
  });

  // Kanallar yaratish
  socket.on("createChannel", ({ channelName, admin }) => {
    channels[channelName] = { admin, messages: [] };
    io.emit("channelCreated", { channelName, admin });
  });

  // Xabar yuborish (oddiy yoki ovozli)
  socket.on("sendMessage", ({ room, message, type, audio }) => {
    const user = users[socket.id] || { username: "Anonim", avatar: "" };
    const msgData = {
      id: Date.now(),
      user,
      message,
      type,
      audio,
    };
    messages[room].push(msgData);
    io.to(room).emit("receiveMessage", msgData);
  });

  // Xabarni o‘chirish
  socket.on("deleteMessage", ({ room, messageId }) => {
    messages[room] = messages[room].filter((msg) => msg.id !== messageId);
    io.to(room).emit("messageDeleted", messageId);
  });

  socket.on("disconnect", () => {
    console.log(`❌ Foydalanuvchi chiqdi: ${socket.id}`);
    delete users[socket.id];
  });
});

server.listen(5000, () => {
  console.log("🔥 Server 5000-portda ishlamoqda...");
});

const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*",
  },
});

app.use(cors());
app.use(express.json());

const users = {};
const messages = {};
const channels = {};

io.on("connection", (socket) => {
  console.log(`🔗 Foydalanuvchi ulandi: ${socket.id}`);

  socket.on("updateProfile", (profile) => {
    users[socket.id] = profile;
  });

  socket.on("joinRoom", (room) => {
    socket.join(room);
    if (!messages[room]) messages[room] = [];
  });

  socket.on("createChannel", ({ channelName, admin }) => {
    channels[channelName] = { admin, messages: [] };
    io.emit("channelCreated", { channelName, admin });
  });

  socket.on("sendMessage", ({ room, message, type, media }) => {
    const user = users[socket.id] || { username: "Anonim", avatar: "" };
    const msgData = {
      id: Date.now(),
      user,
      message,
      type,
      media,
    };
    messages[room].push(msgData);
    io.to(room).emit("receiveMessage", msgData);
  });

  socket.on("deleteMessage", ({ room, messageId }) => {
    messages[room] = messages[room].filter((msg) => msg.id !== messageId);
    io.to(room).emit("messageDeleted", messageId);
  });

  socket.on("editMessage", ({ room, messageId, newText }) => {
    const msg = messages[room].find((msg) => msg.id === messageId);
    if (msg) {
      msg.message = newText;
      io.to(room).emit("messageEdited", { messageId, newText });
    }
  });

  socket.on("disconnect", () => {
    delete users[socket.id];
  });
});

server.listen(5000, () => {
  console.log("🔥 Server 5000-portda ishlamoqda...");
});

const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*",
  },
});

app.use(cors());
app.use(express.json());

const users = {};
const messages = {};
const channels = {};

io.on("connection", (socket) => {
  console.log(`🔗 Foydalanuvchi ulandi: ${socket.id}`);

  socket.on("updateProfile", (profile) => {
    users[socket.id] = { ...profile, status: "online" };
    io.emit("updateUsers", Object.values(users));
  });

  socket.on("joinRoom", (room) => {
    socket.join(room);
    if (!messages[room]) messages[room] = [];
    socket.emit("loadMessages", messages[room]);
  });

  socket.on("sendMessage", ({ room, message, type, media }) => {
    const user = users[socket.id] || { username: "Anonim", avatar: "" };
    const msgData = {
      id: Date.now(),
      user,
      message,
      type,
      media,
    };
    messages[room].push(msgData);
    io.to(room).emit("receiveMessage", msgData);
  });

  socket.on("deleteMessage", ({ room, messageId }) => {
    messages[room] = messages[room].filter((msg) => msg.id !== messageId);
    io.to(room).emit("messageDeleted", messageId);
  });

  socket.on("disconnect", () => {
    if (users[socket.id]) {
      users[socket.id].status = "offline";
      io.emit("updateUsers", Object.values(users));
    }
    delete users[socket.id];
  });
});

server.listen(5000, () => {
  console.log("🔥 Server 5000-portda ishlamoqda...");
});

const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*",
  },
});

app.use(cors());
app.use(express.json());

const users = {};
const messages = {};
const groups = { General: { members: [] } };

io.on("connection", (socket) => {
  console.log(`🔗 Foydalanuvchi ulandi: ${socket.id}`);

  socket.on("updateProfile", (profile) => {
    users[socket.id] = { ...profile, status: "online" };
    io.emit("updateUsers", Object.values(users));
  });

  socket.on("joinGroup", (group) => {
    if (!groups[group]) {
      groups[group] = { members: [], messages: [] };
    }
    groups[group].members.push(socket.id);
    socket.join(group);
    socket.emit("loadMessages", groups[group].messages);
    io.emit("updateGroups", Object.keys(groups));
  });

  socket.on("sendMessage", ({ group, message, type, media }) => {
    const user = users[socket.id] || { username: "Anonim", avatar: "" };
    const msgData = {
      id: Date.now(),
      user,
      message,
      type,
      media,
    };
    groups[group].messages.push(msgData);
    io.to(group).emit("receiveMessage", msgData);
  });

  socket.on("deleteMessage", ({ group, messageId }) => {
    groups[group].messages = groups[group].messages.filter((msg) => msg.id !== messageId);
    io.to(group).emit("messageDeleted", messageId);
  });

  socket.on("disconnect", () => {
    if (users[socket.id]) {
      users[socket.id].status = "offline";
      io.emit("updateUsers", Object.values(users));
    }
    delete users[socket.id];
  });
});

server.listen(5000, () => {
  console.log("🔥 Server 5000-portda ishlamoqda...");
});

const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*",
  },
});

app.use(cors());
app.use(express.json());

const users = {};
const messages = {};
const groups = { General: { members: [], type: "group" } };
const channels = {}; // Kanallarni saqlash

io.on("connection", (socket) => {
  console.log(`🔗 Foydalanuvchi ulandi: ${socket.id}`);

  socket.on("updateProfile", (profile) => {
    users[socket.id] = { ...profile, status: "online", isAdmin: false };
    io.emit("updateUsers", Object.values(users));
  });

  socket.on("createChannel", ({ name, admin }) => {
    if (!channels[name]) {
      channels[name] = { admin, members: [], messages: [] };
      io.emit("updateChannels", Object.keys(channels));
    }
  });

  socket.on("joinChannel", (channel) => {
    if (channels[channel]) {
      channels[channel].members.push(socket.id);
      socket.join(channel);
      socket.emit("loadChannelMessages", channels[channel].messages);
    }
  });

  socket.on("sendMessage", ({ group, message, type, media }) => {
    const user = users[socket.id] || { username: "Anonim", avatar: "" };
    
    if (channels[group] && channels[group].admin !== user.username) {
      return; // Faqat adminlar kanalga yozishi mumkin
    }

    const msgData = {
      id: Date.now(),
      user,
      message,
      type,
      media,
    };

    if (channels[group]) {
      channels[group].messages.push(msgData);
      io.to(group).emit("receiveMessage", msgData);
    } else {
      groups[group].messages.push(msgData);
      io.to(group).emit("receiveMessage", msgData);
    }
  });

  socket.on("disconnect", () => {
    if (users[socket.id]) {
      users[socket.id].status = "offline";
      io.emit("updateUsers", Object.values(users));
    }
    delete users[socket.id];
  });
});

server.listen(5000, () => {
  console.log("🔥 Server 5000-portda ishlamoqda...");
});

const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*",
  },
});

app.use(cors());
app.use(express.json());

const users = {};
const messages = {};
const groups = { General: { members: [], type: "group" } };
const channels = {};

io.on("connection", (socket) => {
  console.log(`🔗 Foydalanuvchi ulandi: ${socket.id}`);

  socket.on("updateProfile", (profile) => {
    users[socket.id] = { ...profile, status: "online", isAdmin: false };
    io.emit("updateUsers", Object.values(users));
  });

  socket.on("createChannel", ({ name, admin }) => {
    if (!channels[name]) {
      channels[name] = { admin, members: [admin], messages: [] };
      io.emit("updateChannels", Object.keys(channels));
    }
  });

  socket.on("joinChannel", ({ channel, username }) => {
    if (channels[channel] && !channels[channel].members.includes(username)) {
      channels[channel].members.push(username);
      socket.join(channel);
      socket.emit("loadChannelMessages", channels[channel].messages);
    }
  });

  socket.on("removeUser", ({ channel, username }) => {
    if (channels[channel] && channels[channel].admin === users[socket.id]?.username) {
      channels[channel].members = channels[channel].members.filter((user) => user !== username);
      io.emit("updateChannelMembers", { channel, members: channels[channel].members });
    }
  });

  socket.on("sendMessage", ({ group, message, type, media }) => {
    const user = users[socket.id] || { username: "Anonim", avatar: "" };

    if (channels[group] && channels[group].admin !== user.username) {
      return; 
    }

    const msgData = { id: Date.now(), user, message, type, media };

    if (channels[group]) {
      channels[group].messages.push(msgData);
      io.to(group).emit("receiveMessage", msgData);
    } else {
      groups[group].messages.push(msgData);
      io.to(group).emit("receiveMessage", msgData);
    }
  });

  socket.on("deleteMessage", ({ group, messageId }) => {
    if (channels[group] && channels[group].admin === users[socket.id]?.username) {
      channels[group].messages = channels[group].messages.filter((msg) => msg.id !== messageId);
      io.to(group).emit("updateMessages", channels[group].messages);
    }
  });

  socket.on("disconnect", () => {
    if (users[socket.id]) {
      users[socket.id].status = "offline";
      io.emit("updateUsers", Object.values(users));
    }
    delete users[socket.id];
  });
});

server.listen(5000, () => {
  console.log("🔥 Server 5000-portda ishlamoqda...");
});

const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");
const multer = require("multer");
const path = require("path");

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*",
  },
});

app.use(cors());
app.use(express.json());
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

const storage = multer.diskStorage({
  destination: "uploads/",
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  },
});

const upload = multer({ storage });

const users = {};
const groups = { General: { messages: [] } };
const channels = {};

io.on("connection", (socket) => {
  console.log(`🔗 Foydalanuvchi ulandi: ${socket.id}`);

  socket.on("updateProfile", (profile) => {
    users[socket.id] = { ...profile, status: "online" };
    io.emit("updateUsers", Object.values(users));
  });

  socket.on("sendMessage", ({ group, message, type, media }) => {
    const user = users[socket.id] || { username: "Anonim" };

    const msgData = { id: Date.now(), user, message, type, media };

    if (channels[group]) {
      channels[group].messages.push(msgData);
      io.to(group).emit("receiveMessage", msgData);
    } else {
      groups[group].messages.push(msgData);
      io.to(group).emit("receiveMessage", msgData);
    }
  });

  socket.on("disconnect", () => {
    delete users[socket.id];
    io.emit("updateUsers", Object.values(users));
  });
});

app.post("/upload", upload.single("file"), (req, res) => {
  res.json({ url: `/uploads/${req.file.filename}` });
});

server.listen(5000, () => {
  console.log("🔥 Server 5000-portda ishlamoqda...");
});

const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");
const multer = require("multer");
const path = require("path");

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*",
  },
});

app.use(cors());
app.use(express.json());
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

const storage = multer.diskStorage({
  destination: "uploads/",
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  },
});

const upload = multer({ storage });

const users = {};
const groups = { General: { messages: [] } };

io.on("connection", (socket) => {
  console.log(`🔗 Foydalanuvchi ulandi: ${socket.id}`);

  socket.on("updateProfile", (profile) => {
    users[socket.id] = { ...profile, status: "online" };
    io.emit("updateUsers", Object.values(users));
  });

  socket.on("sendMessage", ({ group, message, type, media }) => {
    const user = users[socket.id] || { username: "Anonim" };

    const msgData = { id: Date.now(), user, message, type, media };

    groups[group].messages.push(msgData);
    io.to(group).emit("receiveMessage", msgData);
  });

  socket.on("deleteMessage", ({ group, id }) => {
    groups[group].messages = groups[group].messages.filter((msg) => msg.id !== id);
    io.to(group).emit("deleteMessage", id);
  });

  socket.on("editMessage", ({ group, id, newMessage }) => {
    const msg = groups[group].messages.find((msg) => msg.id === id);
    if (msg) {
      msg.message = newMessage;
      io.to(group).emit("editMessage", msg);
    }
  });

  socket.on("disconnect", () => {
    delete users[socket.id];
    io.emit("updateUsers", Object.values(users));
  });
});

app.post("/upload", upload.single("file"), (req, res) => {
  res.json({ url: `/uploads/${req.file.filename}` });
});

server.listen(5000, () => {
  console.log("🔥 Server 5000-portda ishlamoqda...");
});
