const socket = io.connect("http://localhost:3000"); // server.js orqali bog‘lanish

const chatBox = document.getElementById("chatBox");
const messageInput = document.getElementById("messageInput");
const sendButton = document.getElementById("sendButton");
const darkModeToggle = document.getElementById("darkModeToggle");
const usernameInput = document.getElementById("usernameInput");
const joinChat = document.getElementById("joinChat");
const profilePic = document.getElementById("profilePic");
const profilePicInput = document.getElementById("profilePicInput");
const editName = document.getElementById("editName");
const saveProfile = document.getElementById("saveProfile");

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

// Profilni saqlash
saveProfile.addEventListener("click", () => {
    const newName = editName.value.trim();
    if (newName) {
        username = newName;
        socket.emit("updateProfile", { username });
    }
});

// Profil rasmini yuklash
profilePicInput.addEventListener("change", (e) => {
    const file = e.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = () => {
            profilePic.src = reader.result;
            socket.emit("updateProfilePic", reader.result);
        };
        reader.readAsDataURL(file);
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
        socket.emit("chatMessage", { username, message });
        appendMessage({ username, message }, "user");
        messageInput.value = "";
    }
}

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
