import React from "react";
import { v4 as uuid } from "uuid";
import { useParams } from "react-router-dom";
import { useSelector } from "react-redux";
import { send } from "../utils/socket";
import { User } from "../store/usersById/types";
import { listen } from "../utils/socket";

function Story() {
  const { storyId } = useParams<{ storyId: string }>();
  const story = useSelector((state) => state.storiesById[storyId]);
  const users = useSelector(
    (state) =>
      story &&
      story.onlineUserIds
        .map((userId) => {
          const user = state.usersById[userId];

          if (user) return user;

          return {
            id: userId,
            name: null,
          };
        })
        .filter((user): user is User => !!user)
  );
  const [content, setContent] = React.useState<string | null>(null);

  React.useEffect(() => {
    return listen("SET_STORY_CONTENT", (message) => {
      if (message.type !== "SET_STORY_CONTENT") return;

      setContent(message.payload.content);
    });
  }, [setContent]);

  const onContentChange = React.useCallback(
    (event) => {
      const newContent = event.target.value;

      setContent(newContent);

      try {
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
                content: newContent,
              },
            },
          },
        });
      } catch {}
    },
    [setContent, storyId]
  );

  React.useEffect(() => {
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

  const finalContent = content || "";

  return (
    <div>
      <h1>Story Baby</h1>
      {users && (
        <ul>
          {users.map(({ id }) => (
            <li key={id}>{id}</li>
          ))}
        </ul>
      )}
      <textarea value={finalContent} onChange={onContentChange}>
        {finalContent}
      </textarea>
    </div>
  );
}

export default Story;
