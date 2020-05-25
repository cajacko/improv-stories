import React from "react";
import { v4 as uuid } from "uuid";
import { useSelector } from "react-redux";
import { send } from "../utils/socket";
import selectors from "../store/selectors";
import useCanCurrentUserEditStory from "./useCanCurrentUserEditStory";

type RequestTurnState =
  | "CAN_REQUEST_TURN"
  | "REQUESTING"
  | "CANNOT_REQUEST_TURN";

interface UseRequestStoryTurn {
  onRequestTakeTurn: (buffer: number | null) => void;
  requestTurnState: RequestTurnState;
}

function useRequestStoryTurn(
  storyId: string,
  storyType: "LIVE" | "STANDARD"
): UseRequestStoryTurn {
  const lastSession = useSelector((state) =>
    selectors.misc.selectLastStorySession(state, { storyId })
  );
  const lastSessionId = lastSession && lastSession.id;

  const isCurrentUserLastActiveSessionUserForStory = useSelector((state) =>
    selectors.misc.selectIsCurrentUserLastActiveSessionUserForStory(state, {
      storyId,
    })
  );
  const canCurrentUserEditStory = useCanCurrentUserEditStory(
    storyId,
    storyType
  );
  const isCurrentUserActiveSessionUser = useSelector((state) =>
    selectors.misc.selectIsCurrentUserActiveSessionUser(state, { storyId })
  );

  const [requestingSessionId, setRequestingSessionId] = React.useState<
    string | null
  >(null);

  const requestTurnState = React.useMemo((): RequestTurnState => {
    if (storyType !== "STANDARD") {
      return "CANNOT_REQUEST_TURN";
    } else if (canCurrentUserEditStory) {
      return "CANNOT_REQUEST_TURN";
    } else if (isCurrentUserActiveSessionUser) {
      return "CANNOT_REQUEST_TURN";
    } else if (isCurrentUserLastActiveSessionUserForStory) {
      return "CANNOT_REQUEST_TURN";
    } else if (requestingSessionId && requestingSessionId === lastSessionId) {
      return "REQUESTING";
    }

    return "CAN_REQUEST_TURN";
  }, [
    canCurrentUserEditStory,
    isCurrentUserActiveSessionUser,
    isCurrentUserLastActiveSessionUserForStory,
    storyType,
    lastSessionId,
    requestingSessionId,
  ]);

  const onRequestTakeTurn = React.useCallback(
    (buffer: number | null) => {
      if (requestTurnState !== "CAN_REQUEST_TURN") return;

      setRequestingSessionId(lastSessionId);

      send({
        type: "STANDARD_STORY_REQUEST_TAKE_TURN",
        id: uuid(),
        createdAt: new Date().toISOString(),
        payload: {
          storyId,
          buffer,
        },
      });
    },
    [requestTurnState, storyId, lastSessionId]
  );

  return { requestTurnState, onRequestTakeTurn };
}

export default useRequestStoryTurn;
