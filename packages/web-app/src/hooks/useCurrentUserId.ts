import React from "react";
import { onSocketIdChange, getSocketId } from "../utils/socket";

function useCurrentUserId() {
  const [currentUserId, setCurrentUserId] = React.useState(getSocketId());

  React.useEffect(
    () => onSocketIdChange((socketId) => setCurrentUserId(socketId)),
    [setCurrentUserId]
  );

  return currentUserId;
}

export default useCurrentUserId;
