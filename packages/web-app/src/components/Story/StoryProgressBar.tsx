import React from "react";
import { makeStyles, Theme, createStyles } from "@material-ui/core/styles";
import LinearProgress from "@material-ui/core/LinearProgress";
import useStoryCountdown from "../../hooks/useStoryCountdown";
import PlayingStorySession from "../../context/PlayingStorySession";

const normalise = (maxValue: number, minValue: number, value: number) =>
  100 - ((value - minValue) * 100) / (maxValue - minValue);

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    progress: {
      width: "100%",
    },
  })
);

interface Props {
  storyId: string;
  color?: "primary" | "secondary";
}

function StoryStatus({ color, storyId }: Props) {
  const classes = useStyles();
  const countdown = useStoryCountdown(storyId);
  const { playingStorySessionId } = React.useContext(PlayingStorySession);

  if (!!playingStorySessionId) return null;
  if (!countdown) return null;

  return (
    <LinearProgress
      className={classes.progress}
      variant="determinate"
      color={color}
      value={normalise(countdown.totalSeconds, 0, countdown.secondsLeft)}
    />
  );
}

export default React.memo(StoryStatus);
