import React from "react";
import { v4 as uuid } from "uuid";
import { onConnectionChange, getIsConnected } from "../utils/socket";

function useIsConnected() {
  const [isConnected, setIsConnected] = React.useState(getIsConnected());
  const [listenerKey] = React.useState(uuid());

  React.useEffect(
    () =>
      onConnectionChange(listenerKey, (value) => {
        setIsConnected(value);
      }),
    [setIsConnected, listenerKey]
  );

  return isConnected;
}

export default useIsConnected;
