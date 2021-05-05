const formId = document.getElementById("formId");
const msgArea = document.querySelector(".msgArea");
const roomName = document.getElementById("roomName");
const users = document.getElementById("userList");
const leaveBtn = document.getElementById("leaveBtn");

const socket = io();

const { username, room } = Qs.parse(location.search, {
  ignoreQueryPrefix: true,
});
console.log(username, room);

socket.emit("join", { username, room });

socket.on("roomInfo", ({ room, users }) => {
  updateRoomName(room);
  updateUserList(users);
});

socket.on("msg", (msg) => {
  console.log(msg);
  showMessage(msg);
  msgArea.scrollTop = msgArea.scrollHeight;
});

formId.addEventListener("submit", (e) => {
  e.preventDefault();
  const msg = e.target.elements.msg.value;
  if (msg === "" || msg === " ") {
    e.target.elements.msg.value = "";
    return;
  }
  socket.emit("chatMsg", msg.trim());
  e.target.elements.msg.value = "";
  e.target.elements.msg.focus();
});

function showMessage(message) {
  const div = document.createElement("div");
  div.classList.add("chatList");
  div.innerHTML = `<div class="p-1"> <div class="chatBubble bg-dark text-light">
  <p class="line-height pt-2">${message.user} ${message.time}</p>
  <p class="line-height">${message.text}</p>
</div></div>`;
  document.querySelector(".chatMsg").appendChild(div);
}

function updateRoomName(room) {
  roomName.innerHTML = "Group - " + room;
}

function updateUserList(userList) {
  users.innerHTML = "";
  userList.map((user) => {
    const li = document.createElement("li");
    li.classList.add("list-group-item");
    li.innerHTML = user.username;
    users.appendChild(li);
  });
}

leaveBtn.addEventListener("click", () => {
  const leave = confirm("Are you sure want to leave?");
  if (leave) {
    window.location = "../index.html";
  }
});
