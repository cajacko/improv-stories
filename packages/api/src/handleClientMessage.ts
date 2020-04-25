import { v4 as uuid } from "uuid";
import { ServerMessage, ClientMessage } from "./sharedTypes";
import { getUser } from "./store/users";
import {
  getBroadcastGroupUsers,
  addUserToBroadcastGroups,
  removeUserFromBroadcastGroups,
} from "./store/broadcastGroup";
import logger from "./logger";

export function broadcastUsersToGroup(
  broadcastGroupIds: Array<string | null> | null = null
) {
  if (!broadcastGroupIds) return;

  let broadcastedTo: string[] = [];

  broadcastGroupIds.forEach((broadcastGroupId) => {
    if (!broadcastGroupId) return;
    if (broadcastedTo.includes(broadcastGroupId)) return;

    let users = getBroadcastGroupUsers(broadcastGroupId) || [];
    const userIds: string[] = [];

    users.forEach((userId) => {
      const user = getUser(userId);

      if (!user) return;

      userIds.push(user.id);
    });

    broadcastToGroups([broadcastGroupId], {
      id: uuid(),
      createdAt: new Date().toISOString(),
      type: "BROADCAST_GROUP_USERS",
      payload: { userIds, broadcastGroupId },
    });

    broadcastedTo.push(broadcastGroupId);
  });
}

function broadcastToGroups(
  broadcastGroupIds: string[],
  action: ServerMessage,
  ignoreUserIds: string[] = []
) {
  broadcastGroupIds.forEach((broadcastGroupId) => {
    let users = getBroadcastGroupUsers(broadcastGroupId);

    if (!users) return false;

    logger.log("BROADCAST_TO_GROUP", action.type);

    users.forEach((userId) => {
      if (ignoreUserIds.includes(userId)) return;

      const user = getUser(userId);

      if (!user) return;

      user.send(action);
    });
  });
}

function handleClientMessage(
  userId: string,
  action: ClientMessage
  // NOTE: We want to return something other than undefined so TypeScript will ensure we cover every
  // condition
): boolean {
  let user = getUser(userId);

  if (!user) return false;

  const broadcastGroupIds = user.broadcastGroupIds;

  switch (action.type) {
    case "ADD_USER_TO_BROADCAST_GROUPS": {
      if (action.payload.removeFromBroadcastGroups) {
        removeUserFromBroadcastGroups(
          userId,
          action.payload.removeFromBroadcastGroups
        );
      }

      addUserToBroadcastGroups(userId, action.payload.broadcastGroupIds);

      broadcastUsersToGroup([
        ...broadcastGroupIds,
        ...action.payload.broadcastGroupIds,
      ]);

      return true;
    }
    case "REMOVE_USER_FROM_BROADCAST_GROUPS":
      removeUserFromBroadcastGroups(userId, action.payload.broadcastGroupIds);
      broadcastUsersToGroup(broadcastGroupIds);
      return true;
    case "BROADCAST_TO_GROUPS":
      broadcastToGroups(
        action.payload.broadcastGroupIds,
        action.payload.payload
      );
      return true;
    // NOTE: Do not add a default, then TypeScript will ensure we're handling every action
  }
}

export default handleClientMessage;
