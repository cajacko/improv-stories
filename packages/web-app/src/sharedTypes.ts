export interface Message<T, P = undefined> {
  id: string;
  type: T;
  payload: P;
  createdAt: string;
}

export type ClientBroadcastMessage = Message<string, unknown>;

export type ClientMessage<M = ClientBroadcastMessage> =
  | Message<"BROADCAST_TO_GROUPS", { broadcastGroupIds: string[]; payload: M }>
  | Message<
      "ADD_USER_TO_BROADCAST_GROUPS",
      {
        broadcastGroupIds: string[];
        removeFromBroadcastGroups?: "ALL" | string[];
      }
    >
  | Message<
      "REMOVE_USER_FROM_BROADCAST_GROUPS",
      { broadcastGroupIds: "ALL" | string[] }
    >;

export type ServerMessage<M = ClientBroadcastMessage> =
  | Message<
      "BROADCAST_GROUP_USERS",
      { userIds: string[]; broadcastGroupId: string }
    >
  | M;
