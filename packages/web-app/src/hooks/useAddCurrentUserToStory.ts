import React from "react";
import { v4 as uuid } from "uuid";
import { send } from "../utils/socket";

function useAddCurrentUserToStory(storyId: string | null) {
  React.useEffect(() => {
    if (!storyId) return;

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
    } catch {}
  }, [storyId]);
}

export default useAddCurrentUserToStory;
