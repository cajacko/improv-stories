import * as socket from "socket.io";
import broadCastStoriesChanged from "./broadCastStoriesChanged";
import { addUser, removeUser, getGetDate } from "./store";
import { ClientMessage } from "./sharedTypes";
import handleClientMessage from "./handleClientMessage";
import logger from "./logger";

function setupSockets(io: socket.Server) {
  function onClientMessage(userId: string) {
    return (message: ClientMessage) => {
      logger.log("ON_CLIENT_MESSAGE", message.type);

      handleClientMessage(userId, message);
    };
  }

  function onSocketConnect(sock: socket.Socket) {
    const date = getGetDate()();

    const changedStoryIds = addUser({
      id: sock.id,
      name: null,
      dateAdded: date,
      dateModified: date,
      connectedStories: {},
      version: 0,
      socket: sock,
    });

    broadCastStoriesChanged(changedStoryIds);

    sock.on("message", onClientMessage(sock.id));
  }

  function onSocketDisconnect(sock: socket.Socket) {
    const changedStoryIds = removeUser(sock.id);

    broadCastStoriesChanged(changedStoryIds);
  }

  io.on("connection", (sock) => {
    logger.log("CONNECTION");
    onSocketConnect(sock);

    sock.on("disconnect", () => {
      logger.log("DISCONNECT");
      onSocketDisconnect(sock);
    });
  });
}

export default setupSockets;
