import {
  Message,
  ServerMessage as SMessage,
  ClientMessage as CMessage,
} from "./sharedTypes";

export type ClientBroadcastMessage = Message<
  "SET_STORY_CONTENT",
  { content: string }
>;

export type ServerMessage = SMessage<ClientBroadcastMessage>;
export type ClientMessage = CMessage<ClientBroadcastMessage>;
