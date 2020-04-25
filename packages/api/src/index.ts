import * as express from "express";
import * as socket from "socket.io";
import { ClientMessage } from "./sharedTypes";
import { removeUser, addServerUser, getUser } from "./store/users";
import handleClientMessage, {
  broadcastUsersToGroup,
} from "./handleClientMessage";
import logger from "./logger";

const { createServer } = require("http");
const kill = require("kill-port");

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

  broadcastUsersToGroup(user.broadcastGroupIds);
}

io.on("connection", (sock) => {
  logger.log("CONNECTION");
  onSocketConnect(sock);

  sock.on("disconnect", () => {
    logger.log("DISCONNECT");
    onSocketDisconnect(sock);
  });
});

kill(PORT, "tcp")
  .catch()
  .then(() => {
    http.listen(PORT, () => {
      console.log(`listening on *:${PORT}`);
    });
  });
