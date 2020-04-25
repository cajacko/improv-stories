import React from "react";
import { v4 as uuid } from "uuid";
import { User } from "../store/usersById/types";
import { send, listen } from "../utils/socket";
import useCurrentUserId from "./useCurrentUserId";

function useLiveStoryEditor(storyId: string | null) {
  const currentlyEditingUser: User | null = {
    id: "wooo",
    name: "Charlie",
  };

  const currentUserId = useCurrentUserId();

  const [text, setText] = React.useState<string | null>(null);

  const currentUserCanEdit = currentlyEditingUser.id === currentUserId;

  React.useEffect(() => {
    return listen("SET_STORY_CONTENT", (message) => {
      if (message.type !== "SET_STORY_CONTENT") return;

      setText(message.payload.content);
    });
  }, [setText]);

  const onTextChange = React.useCallback(
    (
      value: string | React.ChangeEvent<HTMLTextAreaElement | HTMLInputElement>
    ) => {
      const newText = typeof value === "string" ? value : value.target.value;

      setText(newText);

      try {
        if (!storyId) return;

        send({
          id: uuid(),
          createdAt: new Date().toISOString(),
          type: "BROADCAST_TO_GROUPS",
          payload: {
            broadcastGroupIds: [storyId],
            payload: {
              id: uuid(),
              createdAt: new Date().toISOString(),
              type: "SET_STORY_CONTENT",
              payload: {
                content: newText,
              },
            },
          },
        });
      } catch {}
    },
    [setText, storyId]
  );

  const finalText = text || "";

  return {
    text: finalText,
    onTextChange,
    currentUserCanEdit,
    currentlyEditingUser,
  };
}

export default useLiveStoryEditor;
