import React from "react";
import { makeStyles, createStyles } from "@material-ui/core/styles";
import Typography from "@material-ui/core/Typography";
import Card from "@material-ui/core/Card";
import CardContent from "@material-ui/core/CardContent";

const useStyles = makeStyles(() =>
  createStyles({
    continueCard: {
      maxWidth: 250,
    },
    focusButton: {
      position: "absolute",
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      height: "100%",
      width: "100%",
      border: 0,
      backgroundColor: "#00000090",
      appearance: "none",
      cursor: "pointer",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      padding: 20,
    },
  })
);

interface Props {
  onClick: () => void;
}

function StoryFocusOverlay({ onClick }: Props) {
  const classes = useStyles();

  return (
    <div className={classes.focusButton} onClick={onClick}>
      <Card className={classes.continueCard}>
        <CardContent>
          <Typography variant="overline" color="error">
            It's your turn! Click here to continue the story
          </Typography>
        </CardContent>
      </Card>
    </div>
  );
}

export default React.memo(StoryFocusOverlay);
