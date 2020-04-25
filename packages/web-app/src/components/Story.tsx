import React from "react";
import { v4 as uuid } from "uuid";
import { useParams } from "react-router-dom";
import { useSelector } from "react-redux";
import { send } from "../utils/socket";
import { User } from "../store/usersById/types";

function Story() {
  const { storyId } = useParams<{ storyId: string }>();
  const story = useSelector((state) => state.storiesById[storyId]);
  const users = useSelector(
    (state) =>
      story &&
      story.onlineUserIds
        .map((userId) => state.usersById[userId])
        .filter((user): user is User => !!user)
  );

  React.useEffect(() => {
    try {
      send({
        id: uuid(),
        createdAt: new Date().toISOString(),
        type: "ADD_USER_TO_BROADCAST_GROUP",
        payload: {
          broadcastGroupId: storyId,
        },
      });
    } catch {}
  }, [storyId]);

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
    </div>
  );
}

export default Story;
