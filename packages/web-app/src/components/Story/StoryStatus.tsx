import React from "react";
import { makeStyles, Theme, createStyles } from "@material-ui/core/styles";
import Typography from "@material-ui/core/Typography";
import Button from "@material-ui/core/Button";
import StoryProgressBar from "./StoryProgressBar";
import getZIndex from "../../utils/getZIndex";
import { v4 as uuid } from "uuid";
import { send } from "../../utils/socket";
import { User } from "../../store/usersById/types";
import { useSelector, useDispatch } from "react-redux";
import selectors from "../../store/selectors";
import actions from "../../store/actions";

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
  editingSessionId: string | null;
  secondsLeftProps: null | { secondsLeft: number; totalSeconds: number };
  canCurrentUserEdit: boolean;
  editingUser: User | null;
}

function StoryStatus({
  secondsLeftProps,
  editingSessionId,
  storyId,
  canCurrentUserEdit,
  editingUser,
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

  const classes = useStyles({ backgroundColor });

  let progressBarColor: "secondary" | "primary" =
    backgroundColor === "primary" ? "secondary" : "primary";

  let seconds =
    secondsLeftProps === null
      ? null
      : secondsLeftProps.secondsLeft < 0
      ? 0
      : secondsLeftProps.secondsLeft;

  return (
    <div className={classes.footer}>
      <div className={classes.content}>
        {seconds !== null && (
          <Typography className={classes.time}>{seconds}</Typography>
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
      {seconds !== null && secondsLeftProps && (
        <div className={classes.progress}>
          <StoryProgressBar
            value={seconds}
            color={progressBarColor}
            maxValue={secondsLeftProps.totalSeconds}
          />
        </div>
      )}
    </div>
  );
}

export default React.memo(StoryStatus);
