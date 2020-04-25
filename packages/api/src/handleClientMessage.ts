import { v4 as uuid } from "uuid";
import { ServerMessage, User, ClientMessage } from "./sharedTypes";
import { getUser, setUserDetails } from "./store/users";
import {
  getBroadcastGroupUsers,
  addUserToBroadcastGroup,
  removeUserFromBroadcastGroup,
} from "./store/broadcastGroup";
import logger from "./logger";

function broadcastServerUsersToGroup(
  broadcastGroupId: string | null = null
): boolean {
  if (!broadcastGroupId) return false;

  let users = getBroadcastGroupUsers(broadcastGroupId) || [];
  const transformedServerUsers: User[] = [];

  users.forEach((userId) => {
    const user = getUser(userId);

    if (!user) return;

    const transformedServerUser: User = {
      id: user.id,
      broadcastGroupId: user.broadcastGroupId,
      details: user.details,
    };

    transformedServerUsers.push(transformedServerUser);
  });

  return broadcastToGroup(broadcastGroupId, {
    id: uuid(),
    createdAt: new Date().toISOString(),
    type: "BROADCAST_GROUP_USERS",
    payload: { users: transformedServerUsers, broadcastGroupId },
  });
}

function broadcastToGroup(
  broadcastGroupId: string | null = null,
  payload: ServerMessage,
  ignoreServerUserIds: string[] = []
): boolean {
  if (!broadcastGroupId) return false;

  let users = getBroadcastGroupUsers(broadcastGroupId);

  if (!users) return false;

  logger.log("BROADCAST_TO_GROUP", payload.type);

  users.forEach((userId) => {
    if (ignoreServerUserIds.includes(userId)) return;

    const user = getUser(userId);

    if (!user) return;

    user.send(payload);
  });

  logger.log("BROADCAST_TO_GROUP", "done");

  return true;
}

function handleClientMessage(
  userId: string,
  action: ClientMessage
  // NOTE: We want to return something other than undefined so TypeScript will ensure we cover every
  // condition
): boolean {
  let user = getUser(userId);

  if (!user) return false;

  const broadcastGroupId = user.broadcastGroupId;

  switch (action.type) {
    case "ADD_USER_TO_BROADCAST_GROUP":
      addUserToBroadcastGroup(userId, action.payload.broadcastGroupId);
      broadcastServerUsersToGroup(action.payload.broadcastGroupId);
      return true;
    case "REMOVE_USER_FROM_BROADCAST_GROUP":
      removeUserFromBroadcastGroup(userId);
      broadcastServerUsersToGroup(broadcastGroupId);
      return true;
    case "SET_USER_DETAILS":
      setUserDetails(userId, action.payload);
      broadcastServerUsersToGroup(broadcastGroupId);
      return true;
    case "BROADCAST_TO_GROUP":
      broadcastToGroup(broadcastGroupId, action.payload);
      return true;
    // NOTE: Do not add a default, then TypeScript will ensure we're handling every action
  }
}

export default handleClientMessage;
