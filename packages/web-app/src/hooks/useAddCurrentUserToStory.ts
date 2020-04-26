import React from "react";
import { v4 as uuid } from "uuid";
import { send } from "../utils/socket";

interface AddedUserState {
  [K: string]: boolean;
}

function useAddCurrentUserToStory(storyId: string) {
  const [addedUserState, setAddedUserState] = React.useState<AddedUserState>(
    {}
  );
  const [addInterval, setAddInterval] = React.useState<null | number>(null);

  const addUserToBroadcastGroup = React.useCallback(() => {
    if (addedUserState[storyId]) return;

    try {
      send({
        id: uuid(),
        createdAt: new Date().toISOString(),
        type: "ADD_USER_TO_BROADCAST_GROUPS",
        payload: {
          broadcastGroupIds: [storyId],
          removeFromBroadcastGroups: "ALL",
        },
      });

      setAddedUserState({
        [storyId]: true,
      });
    } catch {
      setAddInterval(setTimeout(addUserToBroadcastGroup, 500));
    }

    return () => {
      if (addInterval) clearTimeout(addInterval);
    };
  }, [storyId, setAddedUserState, addInterval, setAddInterval, addedUserState]);

  React.useEffect(addUserToBroadcastGroup, [addUserToBroadcastGroup]);
}

export default useAddCurrentUserToStory;
