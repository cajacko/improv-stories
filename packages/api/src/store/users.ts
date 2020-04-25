import { ServerMessage, User } from "../sharedTypes";
import { removeUserFromBroadcastGroup } from "./broadcastGroup";

export interface ServerUser extends User {
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
    broadcastGroupId: null,
    details: {},
  };

  usersById[userId] = user;

  return user;
}

export function getUser(userId: string) {
  return usersById[userId] || null;
}

export function removeUser(userId: string): boolean {
  removeUserFromBroadcastGroup(userId);

  delete usersById[userId];

  return true;
}

export function setUserDetails(
  userId: string,
  details: ServerUser["details"]
): boolean {
  const user = getUser(userId);

  if (!user) return false;

  user.details = details;

  return true;
}
