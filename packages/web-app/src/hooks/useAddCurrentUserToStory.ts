import React from "react";
import { v4 as uuid } from "uuid";
import { send } from "../utils/socket";

interface AddedUserState {
  [K: string]: boolean;
}

function useAddCurrentUserToStory(storyId: string) {
  // TODO: Instead check that our userId is in the connectedUsers for this story
  const [addedUserState, setAddedUserState] = React.useState<AddedUserState>(
    {}
  );

  React.useEffect(() => {
    if (addedUserState[storyId]) return;

    const interval = setInterval(() => {
      try {
        send({
          id: uuid(),
          createdAt: new Date().toISOString(),
          type: "LIVE_STORY_ADD_USER_TO_STORY",
          payload: {
            storyId: storyId,
            isActive: false,
          },
        });

        clearInterval(interval);

        setAddedUserState({
          [storyId]: true,
        });
      } catch {}
    }, 500);
  }, [storyId, addedUserState, setAddedUserState]);
}

export default useAddCurrentUserToStory;
