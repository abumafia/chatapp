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
