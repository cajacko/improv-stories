import io from "socket.io-client";
import { ClientMessage, ServerMessage } from "../sharedTypes";

let socket: ReturnType<typeof io> | null = null;
let isConnected = false;

type MessageListener = (message: ServerMessage) => void;
type ConnectionListener = (isConnected: boolean) => void;

const messageListeners: {
  [K: string]: undefined | { [K: string]: MessageListener | undefined };
} = {};

const connectionListeners: { [K: string]: ConnectionListener | undefined } = {};

function setIsConnected() {
  const newIsConnected = !!socket && socket.connected;

  if (isConnected === newIsConnected) return;

  isConnected = newIsConnected;

  Object.values(connectionListeners).forEach((callback) => {
    if (!callback) return;

    callback(isConnected);
  });
}

let hasInit = false;

export function init(userId: string) {
  if (hasInit) return;

  hasInit = true;

  socket = io(`${process.env.REACT_APP_SOCKET_URL}?user_id=${userId}`, {
    transports: ["websocket"],
  });

  socket.on("connect", setIsConnected);
  socket.on("disconnect", setIsConnected);
  socket.on("reconnect_error", setIsConnected);
  socket.on("reconnect_failed", setIsConnected);
  socket.on("error", setIsConnected);
  socket.on("connect_error", setIsConnected);
  socket.on("reconnect", setIsConnected);

  socket.on("message", function (message: ServerMessage) {
    setIsConnected();

    const typeListeners = messageListeners[message.type];

    if (!typeListeners) return;

    Object.values(typeListeners).forEach((callback) => {
      if (!callback) return;

      callback(message);
    });
  });
}

export function send(message: ClientMessage) {
  if (!isConnected || !socket) {
    throw new Error("Could not send message, socket is not connected");
  }

  socket.send(message);
}

export function listen(
  type: ServerMessage["type"],
  key: string,
  callback: MessageListener
) {
  let typeListeners = messageListeners[type] || {};

  typeListeners[key] = callback;

  messageListeners[type] = typeListeners;

  return () => {
    let typeListeners = messageListeners[type];

    if (!typeListeners) return;

    delete typeListeners[key];
  };
}

export function getIsConnected() {
  return isConnected;
}

export function onConnectionChange(key: string, callback: ConnectionListener) {
  connectionListeners[key] = callback;

  return () => {
    delete connectionListeners[key];
  };
}
