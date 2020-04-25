import React from "react";
import { Provider } from "react-redux";
import { createGlobalStyle } from "styled-components";
import { PersistGate } from "redux-persist/integration/react";
import io from "socket.io-client";
import { store, persistor } from "../store";

interface UserProps {}

interface Message<Type, Payload = undefined> {
  type: Type;
  payload: Payload;
}

type ClientMessage =
  | Message<"ADD_USER_TO_STORY", { storyId: string }>
  | Message<"BROADCAST", any>
  | Message<"REMOVE_USER_FROM_STORY">
  | Message<"SET_USER_PROPS", UserProps>;

type ServerMessage =
  | Message<"BROADCAST", any>
  | Message<"STORY_USERS", string[]>
  | Message<"USER_PROPS", { [Key: string]: UserProps }>;

const Global = createGlobalStyle``;

const socket = io("http://localhost:4000");

function sendMessage(message: ClientMessage) {
  socket.send(message);
}

socket.on("connect", function () {
  sendMessage({
    type: "ADD_USER_TO_STORY",
    payload: {
      storyId: "storyId1",
    },
  });
});

socket.on("message", function (data: ServerMessage) {
  console.log("client - on message", data);

  if (data.type === "STORY_USERS") {
    sendMessage({
      type: "SET_USER_PROPS",
      payload: {
        name: "Charlie",
      },
    });
  }
});

socket.on("disconnect", function () {
  console.log("client - disconnect");
});

function App() {
  return (
    <Provider store={store}>
      <PersistGate loading={null} persistor={persistor}>
        <Global />
        <div>Hello</div>
      </PersistGate>
    </Provider>
  );
}

export default App;
