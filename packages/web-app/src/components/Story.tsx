import React from "react";
import { v4 as uuid } from "uuid";
import { useParams } from "react-router-dom";
import { send } from "../utils/socket";

function Story() {
  const params = useParams<{ storyId: string }>();

  React.useEffect(() => {
    try {
      send({
        id: uuid(),
        createdAt: new Date().toISOString(),
        type: "ADD_USER_TO_BROADCAST_GROUP",
        payload: {
          broadcastGroupId: params.storyId,
        },
      });
    } catch {}
  });

  return <h1>Story Baby</h1>;
}

export default Story;
