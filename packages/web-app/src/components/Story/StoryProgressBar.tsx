import React from "react";
import { makeStyles, Theme, createStyles } from "@material-ui/core/styles";
import LinearProgress from "@material-ui/core/LinearProgress";
import Typography from "@material-ui/core/Typography";

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
  maxValue?: number;
  minValue?: number;
  value: number;
  color?: "primary" | "secondary";
}

function StoryStatus({ maxValue = 20, minValue = 0, value, color }: Props) {
  const classes = useStyles();

  return (
    <LinearProgress
      className={classes.progress}
      variant="determinate"
      color={color}
      value={normalise(maxValue, minValue, value)}
    />
  );
}

export default React.memo(StoryStatus);
