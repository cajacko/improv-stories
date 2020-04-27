import React from "react";
import { v4 as uuid } from "uuid";
import { onSocketIdChange, getSocketId } from "../utils/socket";

function useCurrentUserId() {
  const [currentUserId, setCurrentUserId] = React.useState(getSocketId());
  const [listenerKey] = React.useState(uuid());

  React.useEffect(
    () =>
      onSocketIdChange(listenerKey, (socketId) => {
        console.log("setCurrentUserId", socketId);
        setCurrentUserId(socketId);
      }),
    [setCurrentUserId, listenerKey]
  );

  return currentUserId;
}

export default useCurrentUserId;
