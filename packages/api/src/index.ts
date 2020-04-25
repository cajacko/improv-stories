import * as express from "express";
import * as socket from "socket.io";
import { ClientMessage } from "./sharedTypes";
import { removeUser, addServerUser } from "./store/users";
import handleClientMessage from "./handleClientMessage";

// @ts-ignore
const { createServer } = require("http");

const PORT = 4000;

const app = express();
const http = createServer(app);
const io = socket(http);

function onClientMessage(userId: string) {
  return (action: ClientMessage) => {
    handleClientMessage(userId, action);
  };
}

function onSocketConnect(sock: socket.Socket) {
  addServerUser(sock.id, sock.send);

  sock.on("message", onClientMessage(sock.id));
}

function onSocketDisconnect(sock: socket.Socket) {
  removeUser(sock.id);
}

io.on("connection", (sock) => {
  onSocketConnect(sock);

  sock.on("disconnect", () => {
    onSocketDisconnect(sock);
  });
});

http.listen(PORT, () => {
  console.log(`listening on *:${PORT}`);
});
