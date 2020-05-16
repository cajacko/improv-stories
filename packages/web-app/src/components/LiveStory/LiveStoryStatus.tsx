import React from "react";
import { v4 as uuid } from "uuid";
import { send } from "../../utils/socket";
import { User } from "../../store/usersById/types";
import { useSelector, useDispatch } from "react-redux";
import selectors from "../../store/selectors";
import actions from "../../store/actions";
import StoryStatus from "../Story/StoryStatus";

interface Props {
  storyId: string;
  editingSessionId: string | null;
  secondsLeftProps: null | { secondsLeft: number; totalSeconds: number };
  canCurrentUserEdit: boolean;
  editingUser: User | null;
}

function LiveStoryStatus({
  storyId,
  editingSessionId,
  editingUser,
  secondsLeftProps,
  canCurrentUserEdit,
}: Props) {
  const currentUserId = useSelector(selectors.currentUser.selectCurrentUser).id;
  const { canUsersEndRoundEarly } = useSelector((state) =>
    selectors.storyPropsByStoryId.selectStoryPropsContent(state, { storyId })
  );
  const didCurrentUserEndSessionEarly = useSelector((state) =>
    editingSessionId
      ? selectors.didCurrentUserEndSessionEarlyBySessionId.selectDidCurrentUserEndSessionEarlyBySessionId(
          state,
          { sessionId: editingSessionId }
        )
      : false
  );
  const activeUserCount = (
    useSelector((state) =>
      selectors.misc.selectStoryUsers(state, {
        storyId,
        storyUserType: "ACTIVE",
      })
    ) || []
  ).length;
  const dispatch = useDispatch();

  const onDone = React.useCallback(() => {
    if (!editingSessionId) return;

    dispatch(
      actions.didCurrentUserEndSessionEarlyBySessionId.setDidCurrentUserEndSessionEarly(
        { sessionId: editingSessionId }
      )
    );

    send({
      id: uuid(),
      type: "LIVE_STORY_SET_SESSION_DONE",
      createdAt: new Date().toISOString(),
      payload: {
        storyId,
        sessionId: editingSessionId,
      },
    });
  }, [storyId, editingSessionId, dispatch]);

  const isEditingSessionActive = !!editingSessionId;
  const countOfActiveUsersNeeded = 2 - activeUserCount;

  let statusText: string;
  let backgroundColor: "secondary" | "primary" = "primary";
  let showSkipButton = false;
  const updatingText = "Updating...";

  if (isEditingSessionActive) {
    if (secondsLeftProps && secondsLeftProps.secondsLeft >= 0) {
      if (canCurrentUserEdit) {
        statusText = "You are editing! Start typing.";
        backgroundColor = "secondary";
        showSkipButton = true;
      } else {
        if (editingUser) {
          if (didCurrentUserEndSessionEarly) {
            statusText = updatingText;
          } else if (currentUserId === editingUser.id) {
            statusText = `Join the story to finish editing`;
          } else {
            statusText = `${editingUser.name || "Anonymous"} is editing`;
          }
        } else {
          statusText = `Anonymous is editing`;
        }
      }
    } else {
      statusText = updatingText;
    }
  } else if (countOfActiveUsersNeeded > 0) {
    statusText = `Waiting for ${countOfActiveUsersNeeded} more editor${
      countOfActiveUsersNeeded > 1 ? "s" : ""
    } to join the story...`;
  } else {
    statusText = updatingText;
  }

  return (
    <StoryStatus
      secondsLeftProps={secondsLeftProps || undefined}
      statusText={statusText}
      backgroundColor={backgroundColor}
      onDone={showSkipButton && canUsersEndRoundEarly ? onDone : undefined}
    />
  );
}

export default React.memo(LiveStoryStatus);
