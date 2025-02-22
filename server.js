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
