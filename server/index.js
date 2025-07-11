const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const authRoutes = require("./routes/auth");
const messageRoutes = require("./routes/messages");
const app = express();
const socket = require("socket.io");
require("dotenv").config();

app.use(cors());
app.use(express.json());

mongoose
  .connect(process.env.MONGO_URL, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log("DB Connetion Successfull");
  })
  .catch((err) => {
    console.log(err.message);
  });

app.get("/ping", (_req, res) => {
  return res.json({ msg: "Ping Successful" });
});

app.use("/api/auth", authRoutes);
app.use("/api/messages", messageRoutes);

const server = app.listen(process.env.PORT, () =>
  console.log(`Server started on ${process.env.PORT}`)
);
const io = socket(server, {
  cors: {
    origin: "http://localhost:3000",
    credentials: true,
  },
});

global.onlineUsers = new Map();
io.on("connection", (socket) => {
  global.chatSocket = socket;
  socket.on("ImOnline", (userId) => {
    global.onlineUsers.set(userId, socket.id);
    io.emit("getOnlineUsers", Array.from(global.onlineUsers.keys()));
  });

  socket.on("send-msg", (data) => {
    console.log("data", data);

    const sendUserSocket = global.onlineUsers.get(data.to);

    if (sendUserSocket) {
      io.to(sendUserSocket).emit("msg-recieve", data);
    }
  });
  socket.on("send-changed-msg",(data)=>{
    console.log("did you get socket?",data);
    
    const findUserSocket = global.onlineUsers.get(data.to);
    if (findUserSocket) {
      io.to(findUserSocket).emit("msg-changed", data);
    }
  })

  socket.on("send-deleted-msg", (data) => {
    const findUserSocket = global.onlineUsers.get(data.to);
    if (findUserSocket) {
      io.to(findUserSocket).emit("msg-deleted", data);
    }
  });

  socket.on("disconnect", () => {
    onlineUsers.forEach((value, key) => {
      if (value === socket.id) {
        onlineUsers.delete(key);
      }
    });
    io.emit("getOnlineUsers", Array.from(onlineUsers.keys()));
  });
});
