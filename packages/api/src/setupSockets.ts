import * as socket from "socket.io";
import broadCastStoriesChanged from "./broadCastStoriesChanged";
import { addUser, removeUser, getGetDate } from "./store";
import { ClientMessage } from "./sharedTypes";
import handleClientMessage from "./handleClientMessage";

function setupSockets(io: socket.Server) {
  function onClientMessage(userId: string) {
    return (message: ClientMessage) => {
      handleClientMessage(userId, message);
    };
  }

  function onSocketConnect(sock: socket.Socket, userId: string) {
    const date = getGetDate()();

    const changedStoryIds = addUser({
      id: userId,
      name: null,
      dateAdded: date,
      dateModified: date,
      connectedStories: {},
      version: 0,
      socket: sock,
    });

    broadCastStoriesChanged(changedStoryIds);

    sock.on("message", onClientMessage(userId));
  }

  function onSocketDisconnect(userId: string) {
    const changedStoryIds = removeUser(userId);

    broadCastStoriesChanged(changedStoryIds);
  }

  function getUserIdFromSocket(sock: socket.Socket) {
    if (!sock) return null;
    if (!sock.request) return null;
    if (!sock.request._query) return null;
    if (!sock.request._query.user_id) return null;

    return sock.request._query.user_id;
  }

  io.on("connection", (sock) => {
    // The only place we grab the user id
    const userId = getUserIdFromSocket(sock);

    if (!userId) {
      sock.disconnect(true);
      return;
    }

    onSocketConnect(sock, userId);

    sock.on("disconnect", () => {
      onSocketDisconnect(userId);
    });
  });
}

export default setupSockets;
