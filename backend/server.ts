import express, { Application, Request, Response } from "express";
import dotenv from "dotenv";
import { Server } from "socket.io";
import { createServer } from "http";
import { loginUser, signupUser, getUser } from "./src/controllers/user";
import { authMiddleware } from "./src/middlewares/authMiddleware";
import { startMeeting } from "./src/controllers/meeting";
import prismaClient from "./src/utils/prisma";
import cors from "cors";

dotenv.config();

const port = process.env.PORT || 8000;
const app: Application = express();
const server = createServer(app);

const corsOptions = {
  origin: process.env.CLIENT_URL || "http://localhost:5173",
  credentials: true,
  methods: ["GET", "POST"],
};

app.use(cors(corsOptions));
const io = new Server(server, { cors: corsOptions });

const emailToSocketIdMap = new Map<string, string>();
const socketIdToEmailMap = new Map<string, string>();

io.on("connection", (socket) => {
  console.log("User connected:", socket.id);

  socket.on("join-room", (room) => {
    socket.join(room);
    const roomClients = io.sockets.adapter.rooms.get(room);
    const clientsCount = roomClients ? roomClients.size : 0;

    if (clientsCount === 1) {
      socket.emit("created", room, socket.id);
    } else if (clientsCount === 2) {
      socket.emit("joined", room, socket.id);
      socket.to(room).emit("peer-connected", socket.id);
    } else {
      socket.emit("full", room);
    }
  });

  socket.on("offer", (data) => {
    socket.to(data.to).emit("offer", { offer: data.offer, from: socket.id });
  });

  socket.on("answer", (data) => {
    socket.to(data.to).emit("answer", { answer: data.answer, from: socket.id });
  });

  socket.on("ice-candidate", (data) => {
    socket
      .to(data.to)
      .emit("ice-candidate", { candidate: data.candidate, from: socket.id });
  });

  socket.on("disconnect", () => {
    console.log("User disconnected:", socket.id);
    socket.broadcast.emit("peer-disconnected", socket.id);
  });
});

app.use(express.json());

app.get("/", (req: Request, res: Response) => {
  res.send("Welcome to Express & TypeScript Server");
});

app.post("/signup", signupUser);
app.post("/login", loginUser);
app.get("/user", authMiddleware, getUser);
app.post("/start-meeting", authMiddleware, startMeeting);

server.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});
