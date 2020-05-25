import React from "react";
import { makeStyles, Theme, createStyles } from "@material-ui/core/styles";
import Typography from "@material-ui/core/Typography";
import Button from "@material-ui/core/Button";
import StoryProgressBar from "./StoryProgressBar";
import getZIndex from "../../utils/getZIndex";
import { v4 as uuid } from "uuid";
import { send } from "../../utils/socket";
import { useSelector, useDispatch } from "react-redux";
import selectors from "../../store/selectors";
import actions from "../../store/actions";
import useStoryCountdown from "../../hooks/useStoryCountdown";
import useCanCurrentUserEditStory from "../../hooks/useCanCurrentUserEditStory";
import PlayingStorySession from "../../context/PlayingStorySession";

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    footer: {
      width: "100%",
      display: "flex",
      height: "50px",
      backgroundColor: ({
        backgroundColor,
      }: {
        backgroundColor: "secondary" | "primary";
      }) => theme.palette[backgroundColor].main,
      position: "relative",
      zIndex: getZIndex("STORY_STATUS"),
      flexDirection: "column",
    },
    content: {
      flex: 1,
      display: "flex",
      flexDirection: "row",
      position: "relative",
      alignItems: "center",
      justifyContent: "center",
    },
    name: {
      color: theme.palette.background.default,
    },
    time: {
      color: theme.palette.background.default,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      position: "absolute",
      top: 0,
      left: theme.spacing(2),
      bottom: 0,
    },
    progress: {
      width: "100%",
    },
    doneContainer: {
      position: "absolute",
      top: 0,
      right: theme.spacing(2),
      bottom: 0,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
    },
    doneButton: {
      color: theme.palette.common.white,
    },
  })
);

interface Props {
  storyId: string;
  storyType: "LIVE" | "STANDARD";
}

function StoryStatus({ storyId, storyType }: Props) {
  const activeSession = useSelector((state) =>
    selectors.misc.selectActiveStorySession(state, { storyId })
  );
  const activeSessionId = activeSession && activeSession.id;
  const { playingStorySessionId } = React.useContext(PlayingStorySession);

  const playingSession = useSelector((state) =>
    playingStorySessionId
      ? selectors.sessionsById.selectSession(state, {
          sessionId: playingStorySessionId,
        })
      : null
  );

  const playingSessionUser = useSelector((state) =>
    playingSession
      ? selectors.usersById.selectUser(state, { userId: playingSession.userId })
      : null
  );
  const playingSessionUserName = playingSessionUser && playingSessionUser.name;

  const currentlyEditingUser = useSelector((state) =>
    selectors.misc.selectCurrentlyEditingStoryUser(state, { storyId })
  );

  const canCurrentUserEditStory = useCanCurrentUserEditStory(
    storyId,
    storyType
  );
  const currentUserId = useSelector(selectors.currentUser.selectCurrentUser).id;
  const countdown = useStoryCountdown(storyId);

  const isCurrentUserLastActiveSessionUserForStory = useSelector((state) =>
    selectors.misc.selectIsCurrentUserLastActiveSessionUserForStory(state, {
      storyId,
    })
  );

  const { canUsersEndRoundEarly } = useSelector((state) =>
    selectors.storyPropsByStoryId.selectStoryPropsContent(state, { storyId })
  );
  const didCurrentUserEndSessionEarly = useSelector((state) =>
    activeSessionId
      ? selectors.didCurrentUserEndSessionEarlyBySessionId.selectDidCurrentUserEndSessionEarlyBySessionId(
          state,
          { sessionId: activeSessionId }
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
    if (!activeSessionId) return;

    dispatch(
      actions.didCurrentUserEndSessionEarlyBySessionId.setDidCurrentUserEndSessionEarly(
        { sessionId: activeSessionId }
      )
    );

    send({
      id: uuid(),
      type: "LIVE_STORY_SET_SESSION_DONE",
      createdAt: new Date().toISOString(),
      payload: {
        storyId,
        sessionId: activeSessionId,
      },
    });
  }, [storyId, activeSessionId, dispatch]);

  const isEditingSessionActive = !!activeSessionId;
  const countOfActiveUsersNeeded = 2 - activeUserCount;

  let statusText: string;
  let backgroundColor: "secondary" | "primary" = "primary";
  let showSkipButton = false;
  const updatingText = "Updating...";

  if (!!playingStorySessionId) {
    statusText = `Playing entry by ${playingSessionUserName || "Anonymous"}`;
  } else if (isEditingSessionActive) {
    if (!!countdown) {
      if (canCurrentUserEditStory) {
        statusText = "You are editing! Start typing.";
        backgroundColor = "secondary";
        showSkipButton = true;
      } else {
        if (currentlyEditingUser) {
          if (didCurrentUserEndSessionEarly) {
            statusText = updatingText;
          } else if (
            storyType === "LIVE" &&
            currentUserId === currentlyEditingUser.id
          ) {
            statusText = `Join the story to finish editing`;
          } else {
            statusText = `${
              currentlyEditingUser.name || "Anonymous"
            } is editing`;
          }
        } else {
          statusText = `Anonymous is editing`;
        }
      }
    } else {
      statusText = updatingText;
    }
  } else if (storyType === "LIVE" && countOfActiveUsersNeeded > 0) {
    statusText = `Waiting for ${countOfActiveUsersNeeded} more editor${
      countOfActiveUsersNeeded > 1 ? "s" : ""
    } to join the story...`;
  } else if (
    storyType === "STANDARD" &&
    isCurrentUserLastActiveSessionUserForStory
  ) {
    statusText = "You went last! Wait for someone else to go.";
  } else if (storyType === "STANDARD") {
    statusText = "Scroll down and take your turn!";
  } else {
    statusText = updatingText;
  }

  const classes = useStyles({ backgroundColor });

  let progressBarColor: "secondary" | "primary" =
    backgroundColor === "primary" ? "secondary" : "primary";

  return (
    <div className={classes.footer}>
      <div className={classes.content}>
        {!!countdown && (
          <Typography className={classes.time}>
            {countdown.secondsLeft}
          </Typography>
        )}
        <Typography className={classes.name}>{statusText}</Typography>
        {onDone && showSkipButton && canUsersEndRoundEarly && (
          <div className={classes.doneContainer}>
            <Button className={classes.doneButton} onClick={onDone}>
              Done
            </Button>
          </div>
        )}
      </div>
      {!!countdown && (
        <div className={classes.progress}>
          <StoryProgressBar storyId={storyId} color={progressBarColor} />
        </div>
      )}
    </div>
  );
}

export default React.memo(StoryStatus);
