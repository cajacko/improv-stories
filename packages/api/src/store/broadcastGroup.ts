import { getUser } from "./users";

const usersByBroadcastGroupId: { [K: string]: string[] | undefined } = {};

export function getBroadcastGroupUsers(broadcastGroupId: string) {
  return usersByBroadcastGroupId[broadcastGroupId] || null;
}

export function addUserToBroadcastGroup(
  userId: string,
  broadcastGroupId: string
): boolean {
  const user = getUser(userId);

  if (!user) return false;

  user.broadcastGroupId = broadcastGroupId;

  const users = usersByBroadcastGroupId[broadcastGroupId] || [];

  users.push(userId);

  usersByBroadcastGroupId[broadcastGroupId] = users;

  return true;
}

export function removeUserFromBroadcastGroup(userId: string): boolean {
  const user = getUser(userId);

  if (user) {
    const broadcastGroupId = user.broadcastGroupId;

    if (broadcastGroupId) {
      let users = usersByBroadcastGroupId[broadcastGroupId];

      if (users) {
        users = users.filter((id) => id !== userId);

        if (users.length <= 0) {
          delete usersByBroadcastGroupId[broadcastGroupId];
        } else {
          usersByBroadcastGroupId[broadcastGroupId] = users;
        }
      }
    }
  }

  return true;
}
