const experss = require("express");
const http = require("http");
const socketio = require("socket.io");
const cors = require("cors");
const messageFormat = require("./utils/message");
const {
  getCurrentUser,
  joinUsers,
  userLeave,
  getRoomsList,
} = require("./utils/users");

const app = experss();
const server = http.createServer(app);
const io = socketio(server, {
  cors: {
    origin: "*",
  },
});

app.use(cors());

app.get("/", (req, res) => {
  res.status(200).json({ msg: "Socket Working" });
});

const bot = "Admin";
io.on("connection", (socket) => {
  socket.on("join", ({ username, room }) => {
    const user = joinUsers(socket.id, username, room);
    socket.join(user.room);
    socket.emit("msg", messageFormat(bot, "Hello client"));
    socket.broadcast
      .to(user.room)
      .emit("msg", messageFormat(bot, `${user.username} joined the chat`));

    const list = getRoomsList(user.room);
    console.log(list);

    io.to(user.room).emit("roomInfo", {
      room: user.room,
      users: list,
    });
    socket.on("chatMsg", (msg) => {
      const user = getCurrentUser(socket.id);
      io.to(user.room).emit("msg", messageFormat(user.username, msg));
    });
  });

  socket.on("disconnect", () => {
    const user = userLeave(socket.id);
    if (user) {
      io.to(user.room).emit(
        "msg",
        messageFormat(bot, `${user.username} has left the chat`)
      );
      io.to(user.room).emit("roomInfo", {
        room: user.room,
        users: getRoomsList(user.room),
      });
    }
  });
});

const PORT = process.env.PORT || 5000;

server.listen(PORT, () => console.log(`Server Running on ${PORT}`));
