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
  origin: "http://localhost:5173",
  credentials: true,
  methods: ["GET", "POST"],
};

app.use(cors(corsOptions));
const io = new Server(server, { cors: corsOptions });

const emailToSocketIdMap = new Map<string, string>();
const socketIdToEmailMap = new Map<string, string>();

io.on("connection", (socket) => {
  console.log(`User connected: ${socket.id}`);

  socket.on("join-meeting", async (data) => {
    const { meetingId, userId } = data;

    const user = await prismaClient.user.findFirst({
      where: { id: userId },
    });

    if (!user) {
      socket.emit("user-left", { email: userId, socketId: socket.id });
      return;
    }
    socket.join(meetingId);
    emailToSocketIdMap.set(user.email, socket.id);
    socketIdToEmailMap.set(socket.id, user.email);
    io.to(meetingId).emit("user-joined", {
      ...user,
      socketId: socket.id,
    });
  });

  socket.on("user:call", ({ to, offer }) => {
    console.log(to, offer);
    io.to(to).emit("incomming:call", { from: socket.id, offer });
  });

  socket.on("call:accepted", ({ to, ans }) => {
    io.to(to).emit("call:accepted", { from: socket.id, ans });
  });

  socket.on("peer:nego:needed", ({ to, offer }) => {
    console.log("peer:nego:needed", offer);
    io.to(to).emit("peer:nego:needed", { from: socket.id, offer });
  });

  socket.on("peer:nego:done", ({ to, ans }) => {
    console.log("peer:nego:done", ans);
    io.to(to).emit("peer:nego:final", { from: socket.id, ans });
  });

  socket.on("disconnect", () => {
    console.log(`User disconnected: ${socket.id}`);
    const email = socketIdToEmailMap.get(socket.id);
    if (email) {
      emailToSocketIdMap.delete(email);
      socketIdToEmailMap.delete(socket.id);
      for (const room of socket.rooms) {
        socket.leave(room);
        io.to(room).emit("user-left", { email, socketId: socket.id });
      }
    }
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
