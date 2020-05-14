import React from "react";
import { makeStyles, Theme, createStyles } from "@material-ui/core/styles";
import Typography from "@material-ui/core/Typography";
import Button from "@material-ui/core/Button";
import StoryProgressBar from "./StoryProgressBar";
import getZIndex from "../../utils/getZIndex";

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
  secondsLeftProps?: { secondsLeft: number; totalSeconds: number };
  backgroundColor?: "secondary" | "primary";
  statusText: string;
  onDone?: () => void;
}

function StoryStatus({
  secondsLeftProps,
  backgroundColor = "primary",
  statusText,
  onDone,
}: Props) {
  const classes = useStyles({ backgroundColor });

  let progressBarColor: "secondary" | "primary" =
    backgroundColor === "primary" ? "secondary" : "primary";

  let seconds =
    secondsLeftProps === undefined
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
        {onDone && (
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
