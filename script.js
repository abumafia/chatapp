const socket = io();
const chatBox = document.getElementById("chatBox");
const messageInput = document.getElementById("messageInput");
const sendButton = document.getElementById("sendButton");
const darkModeToggle = document.getElementById("darkModeToggle");
const usernameInput = document.getElementById("usernameInput");
const joinChat = document.getElementById("joinChat");

let username = "";

// Chatga kirish
joinChat.addEventListener("click", () => {
    username = usernameInput.value.trim();
    if (username) {
        socket.emit("join", username);
        usernameInput.disabled = true;
        joinChat.disabled = true;
        messageInput.disabled = false;
        sendButton.disabled = false;
    }
});

// Xabar jo'natish
sendButton.addEventListener("click", sendMessage);
messageInput.addEventListener("keypress", (e) => {
    if (e.key === "Enter") sendMessage();
});

function sendMessage() {
    const message = messageInput.value.trim();
    if (message) {
        const data = { username, message };
        socket.emit("chatMessage", data);
        appendMessage(data, "user");
        messageInput.value = "";
    }
}

// Xabarni chat oynasiga qo'shish
function appendMessage({ username, message }, type) {
    const msgDiv = document.createElement("div");
    msgDiv.classList.add("message", type);
    msgDiv.innerHTML = `<strong>${username}:</strong> ${message}`;
    chatBox.appendChild(msgDiv);
    chatBox.scrollTop = chatBox.scrollHeight;
}

// Serverdan xabar qabul qilish
socket.on("chatMessage", (data) => {
    appendMessage(data, "other");
});

// Dark Mode
darkModeToggle.addEventListener("click", () => {
    document.body.classList.toggle("dark-mode");
});
