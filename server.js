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
