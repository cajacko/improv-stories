import React from "react";
import { makeStyles, Theme, createStyles } from "@material-ui/core/styles";
import Typography from "@material-ui/core/Typography";
import { User } from "../../store/usersById/types";
import { useSelector } from "react-redux";
import selectors from "../../store/selectors";
import StoryProgressBar from "./StoryProgressBar";

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    footer: {
      width: "100%",
      display: "flex",
      height: "50px",
      backgroundColor: (isActive) =>
        isActive ? theme.palette.secondary.main : theme.palette.primary.main,
      alignItems: "center",
      justifyContent: "center",
      position: "relative",
    },
    name: {
      color: theme.palette.background.default,
    },
    time: {
      color: theme.palette.background.default,
      position: "absolute",
      top: 0,
      right: 0,
      bottom: 0,
      padding: theme.spacing(2),
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
    },
    progress: {
      position: "absolute",
      bottom: 0,
      right: 0,
      left: 0,
    },
  })
);

interface Props {
  isEditingSessionActive: boolean;
  secondsLeft: number | null;
  canCurrentUserEdit: boolean;
  editingUser: User | null;
}

function StoryStatus({
  isEditingSessionActive,
  editingUser,
  secondsLeft,
  canCurrentUserEdit,
}: Props) {
  const classes = useStyles(canCurrentUserEdit);
  const currentUserId = useSelector(selectors.currentUser.selectCurrentUser).id;

  let statusText = "Waiting for more users to join...";

  if (isEditingSessionActive) {
    if (secondsLeft && secondsLeft >= 0) {
      if (canCurrentUserEdit) {
        statusText = "You are editing! Start typing.";
      } else {
        if (editingUser) {
          if (currentUserId === editingUser.id) {
            statusText = `Join the story to finish editing`;
          } else {
            statusText = `${editingUser.name || "Anonymous"} is editing`;
          }
        } else {
          statusText = `Anonymous is editing`;
        }
      }
    } else {
      statusText = "Updating...";
    }
  }

  let seconds = secondsLeft !== null && secondsLeft < 0 ? 0 : secondsLeft;

  return (
    <div className={classes.footer}>
      <Typography className={classes.name}>{statusText}</Typography>
      {seconds !== null && (
        <>
          <Typography className={classes.time}>{seconds}</Typography>
          <div className={classes.progress}>
            <StoryProgressBar
              value={seconds}
              color={canCurrentUserEdit ? "primary" : "secondary"}
            />
          </div>
        </>
      )}
    </div>
  );
}

export default React.memo(StoryStatus);
