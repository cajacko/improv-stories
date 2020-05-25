import React from "react";
import { v4 as uuid } from "uuid";
import { useSelector } from "react-redux";
import { send } from "../utils/socket";
import { Session } from "../store/sessionsById/types";
import selectors from "../store/selectors";
import useCanCurrentUserEditStory from "./useCanCurrentUserEditStory";

type RequestTurnState =
  | "CAN_REQUEST_TURN"
  | "REQUESTING"
  | "CANNOT_REQUEST_TURN";

interface UseRequestStoryTurn {
  onRequestTakeTurn: (lastSession: Session | null) => void;
  requestTurnState: RequestTurnState;
}

function useRequestStoryTurn(
  storyId: string,
  storyType: "LIVE" | "STANDARD"
): UseRequestStoryTurn {
  const activeSession = useSelector((state) =>
    selectors.misc.selectActiveStorySession(state, { storyId })
  );
  const activeSessionId = activeSession && activeSession.id;

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
    } else if (requestingSessionId && requestingSessionId === activeSessionId) {
      return "REQUESTING";
    }

    return "CAN_REQUEST_TURN";
  }, [
    canCurrentUserEditStory,
    isCurrentUserActiveSessionUser,
    isCurrentUserLastActiveSessionUserForStory,
    storyType,
    activeSessionId,
    requestingSessionId,
  ]);

  const onRequestTakeTurn = React.useCallback(
    (lastSession: Session | null) => {
      if (!activeSessionId) return;
      if (requestTurnState !== "CAN_REQUEST_TURN") return;

      setRequestingSessionId(activeSessionId);

      send({
        type: "STANDARD_STORY_REQUEST_TAKE_TURN",
        id: uuid(),
        createdAt: new Date().toISOString(),
        payload: {
          storyId,
          lastSession,
        },
      });
    },
    [requestTurnState, storyId, activeSessionId]
  );

  return { requestTurnState, onRequestTakeTurn };
}

export default useRequestStoryTurn;
