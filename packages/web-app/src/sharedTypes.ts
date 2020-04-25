export type User = {
  id: string;
  broadcastGroupId: null | string;
  details: {
    name?: string;
  };
};

export interface Message<T, P = undefined> {
  id: string;
  type: T;
  payload: P;
  createdAt: string;
}

export type ClientMessage =
  | Message<"BROADCAST_TO_GROUP", ServerMessage>
  | Message<"ADD_USER_TO_BROADCAST_GROUP", { broadcastGroupId: string }>
  | Message<"REMOVE_USER_FROM_BROADCAST_GROUP">
  | Message<"SET_USER_DETAILS", User["details"]>;

export type ServerMessage = Message<
  "BROADCAST_GROUP_USERS",
  { users: User[]; broadcastGroupId: string }
>;
