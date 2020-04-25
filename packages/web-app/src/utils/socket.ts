import io from "socket.io-client";
import { ClientMessage, ServerMessage } from "../types";

const socket = io("http://localhost:4000");

let isConnected = false;

type Listener = (message: ServerMessage) => void;
type ConnectionListener = (isConnected: boolean) => void;

const listeners: {
  [K: string]: undefined | { [K: string]: Listener | undefined };
} = {};

const connectionListeners: { [K: string]: ConnectionListener | undefined } = {};

function setIsConnected(value: boolean) {
  isConnected = value;

  Object.values(connectionListeners).forEach((callback) => {
    if (!callback) return;

    callback(value);
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
  if (!isConnected) {
    throw new Error("Could not get the socket id, socket disconnected");
  }

  return socket.id;
}

export function send(message: ClientMessage) {
  if (!isConnected) {
    throw new Error("Could not send message, socket disconnected");
  }

  socket.send(message);
}

export function listen(type: ServerMessage["type"], callback: Listener) {
  let typeListeners = listeners[type] || {};

  // @ts-ignore
  const key = callback as string;

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

export function onConnectionChange(callback: ConnectionListener) {
  // @ts-ignore
  const key = callback as string;

  connectionListeners[key] = callback;

  return () => {
    delete connectionListeners[key];
  };
}
