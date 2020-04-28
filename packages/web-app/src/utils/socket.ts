import io from "socket.io-client";
import { ClientMessage, ServerMessage } from "../sharedTypes";

const socket = io("http://localhost:4000");

let isConnected = false;
let socketId: string | null = null;

type Listener = (message: ServerMessage) => void;
type ConnectionListener = (isConnected: boolean) => void;
type IdListener = (socketId: string | null) => void;

const listeners: {
  [K: string]: undefined | { [K: string]: Listener | undefined };
} = {};

const idListeners: { [K: string]: IdListener | undefined } = {};
const connectionListeners: { [K: string]: ConnectionListener | undefined } = {};

function setIsConnected(value: boolean) {
  isConnected = value;
  socketId = value ? socket.id : null;

  Object.values(connectionListeners).forEach((callback) => {
    if (!callback) return;

    callback(value);
  });

  Object.values(idListeners).forEach((callback) => {
    if (!callback) return;

    callback(socketId);
  });
}

socket.on("connect", function () {
  setIsConnected(true);
});

socket.on("disconnect", function () {
  setIsConnected(false);
});

socket.on("message", function (message: ServerMessage) {
  const typeListeners = listeners[message.type];

  if (!typeListeners) return;

  Object.values(typeListeners).forEach((callback) => {
    if (!callback) return;

    callback(message);
  });
});

export function getSocketId() {
  return socketId;
}

export function onSocketIdChange(key: string, callback: IdListener) {
  idListeners[key] = callback;

  return () => {
    delete idListeners[key];
  };
}

export function send(message: ClientMessage) {
  if (!isConnected) {
    throw new Error("Could not send message, socket disconnected");
  }

  socket.send(message);
}

export function listen(
  type: ServerMessage["type"],
  key: string,
  callback: Listener
) {
  let typeListeners = listeners[type] || {};

  typeListeners[key] = callback;

  listeners[type] = typeListeners;

  return () => {
    let typeListeners = listeners[type];

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
