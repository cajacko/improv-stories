import { getUser } from "./users";

const usersByBroadcastGroupId: { [K: string]: string[] | undefined } = {};

export function getBroadcastGroupUsers(broadcastGroupId: string) {
  return usersByBroadcastGroupId[broadcastGroupId] || null;
}

export function removeUserFromBroadcastGroups(
  userId: string,
  broadcastGroupIds: "ALL" | string[]
) {
  const user = getUser(userId);

  if (!user) return;

  const userBroadcastGroupIds = user.broadcastGroupIds;

  userBroadcastGroupIds.forEach((broadcastGroupId) => {
    if (
      broadcastGroupIds !== "ALL" &&
      !userBroadcastGroupIds.includes(broadcastGroupId)
    ) {
      return;
    }

    let users = usersByBroadcastGroupId[broadcastGroupId];

    if (users) {
      users = users.filter((id) => id !== userId);

      if (users.length <= 0) {
        delete usersByBroadcastGroupId[broadcastGroupId];
      } else {
        usersByBroadcastGroupId[broadcastGroupId] = users;
      }
    }
  });
}

export function addUserToBroadcastGroups(
  userId: string,
  broadcastGroupIds: string[]
) {
  const user = getUser(userId);

  if (!user) return;

  broadcastGroupIds.forEach((broadcastGroupId) => {
    if (!user.broadcastGroupIds.includes(broadcastGroupId)) {
      user.broadcastGroupIds.push(broadcastGroupId);
    }

    const users = usersByBroadcastGroupId[broadcastGroupId] || [];

    users.push(userId);

    usersByBroadcastGroupId[broadcastGroupId] = users;
  });
}
