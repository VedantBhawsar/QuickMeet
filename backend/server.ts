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
  console.log(`User connected: ${socket.id}`);

  socket.on("join-meeting", async (data) => {
    try {
      const { meetingId, userId } = data;

      const user = await prismaClient.user.findFirst({
        where: { id: userId },
      });

      if (!user) {
        socket.emit("error", { message: "User not found" });
        return;
      }

      // Leave any existing rooms
      socket.rooms.forEach((room) => {
        if (room !== socket.id) {
          socket.leave(room);
        }
      });

      // Join new meeting room
      socket.join(meetingId);
      emailToSocketIdMap.set(user.email, socket.id);
      socketIdToEmailMap.set(socket.id, user.email);

      // Notify all users in the room about the new user
      io.to(meetingId).emit("user-joined", {
        ...user,
        socketId: socket.id,
      });
    } catch (error) {
      console.error("Error in join-meeting:", error);
      socket.emit("error", { message: "Failed to join meeting" });
    }
  });

  socket.on("user:call", ({ to, offer }) => {
    io.to(to).emit("incomming:call", { from: socket.id, offer });
  });

  socket.on("call:accepted", ({ to, ans }) => {
    io.to(to).emit("call:accepted", { from: socket.id, ans });
  });

  socket.on("disconnect", () => {
    console.log(`User disconnected: ${socket.id}`);
    const email = socketIdToEmailMap.get(socket.id);
    if (email) {
      emailToSocketIdMap.delete(email);
      socketIdToEmailMap.delete(socket.id);

      // Notify all rooms this socket was in
      socket.rooms.forEach((room) => {
        if (room !== socket.id) {
          io.to(room).emit("user-left", { email, socketId: socket.id });
        }
      });
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
