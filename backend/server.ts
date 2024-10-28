import express, { Express, Request, Response, Application } from "express";
import dotenv from "dotenv";
import { Server } from "socket.io";
import { createServer } from "http";

//For env File
dotenv.config();

const app: Application = express();
const server = createServer(app);
const io = new Server(server);

const port = process.env.PORT || 8000;

io.on("connection", (socket) => {
  console.log("A user connected" + socket.id);
});

app.get("/", (req: Request, res: Response) => {
  res.send("Welcome to Express & TypeScript Server");
});

app.listen(port, () => {
  console.log(`Server is Fire at http://localhost:${port}`);
});
