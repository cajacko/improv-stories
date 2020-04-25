import { ServerMessage } from "../sharedTypes";
import { removeUserFromBroadcastGroups } from "./broadcastGroup";

export interface ServerUser {
  id: string;
  broadcastGroupIds: string[];
  send: (action: ServerMessage) => void;
}

const usersById: { [K: string]: ServerUser | undefined } = {};

export function addServerUser(
  userId: string,
  send: ServerUser["send"]
): ServerUser {
  const user: ServerUser = {
    id: userId,
    send,
    broadcastGroupIds: [],
  };

  usersById[userId] = user;

  return user;
}

export function getUser(userId: string) {
  return usersById[userId] || null;
}

export function removeUser(userId: string): boolean {
  removeUserFromBroadcastGroups(userId, "ALL");

  delete usersById[userId];

  return true;
}
