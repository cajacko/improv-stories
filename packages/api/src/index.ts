import * as express from "express";
import * as socket from "socket.io";
import { ClientMessage } from "./sharedTypes";
import { removeUser, addServerUser, getUser } from "./store/users";
import handleClientMessage, {
  broadcastServerUsersToGroup,
} from "./handleClientMessage";
import logger from "./logger";

// @ts-ignore
const { createServer } = require("http");

const PORT = 4000;

const app = express();
const http = createServer(app);
const io = socket(http);

function onClientMessage(userId: string) {
  return (message: ClientMessage) => {
    logger.log("ON_CLIENT_MESSAGE", message.type);

    handleClientMessage(userId, message);
  };
}

function onSocketConnect(sock: socket.Socket) {
  addServerUser(sock.id, (action) => sock.send(action));

  sock.on("message", onClientMessage(sock.id));
}

function onSocketDisconnect(sock: socket.Socket) {
  const user = getUser(sock.id);
  removeUser(sock.id);

  if (!user) return;

  broadcastServerUsersToGroup([user.broadcastGroupId]);
}

io.on("connection", (sock) => {
  logger.log("CONNECTION");
  onSocketConnect(sock);

  sock.on("disconnect", () => {
    logger.log("DISCONNECT");
    onSocketDisconnect(sock);
  });
});

http.listen(PORT, () => {
  console.log(`listening on *:${PORT}`);
});
