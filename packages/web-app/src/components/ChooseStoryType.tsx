import React from "react";
import { v4 as uuid } from "uuid";
import { useHistory } from "react-router-dom";
import Grid from "@material-ui/core/Grid";
import StoryTypeCard from "./StoryTypeCard";
import { makeStyles } from "@material-ui/core/styles";

const useStyles = makeStyles({
  root: {
    maxWidth: 500,
  },
});

function ChooseStoryType() {
  const classes = useStyles();
  const { push } = useHistory();

  const onLiveStoryClick = React.useCallback(() => {
    push(`/story/live/${uuid()}`);
  }, [push]);

  const onStandardStoryClick = React.useCallback(() => {
    push(`/story/standard/${uuid()}`);
  }, [push]);

  return (
    <div className={classes.root}>
      <Grid container justify="center" spacing={2}>
        <Grid item xs={6}>
          <StoryTypeCard
            title="Standard Story"
            description="Play with friends over multiple days. Take it in turns to write a story together and get notifications when you can take your next turn."
            onClick={onStandardStoryClick}
          />
        </Grid>
        <Grid item xs={6}>
          <StoryTypeCard
            title="Live Story"
            description="Get online with friends and play in realtime. Write a story in the moment, seeing what people type as their typing."
            onClick={onLiveStoryClick}
          />
        </Grid>
      </Grid>
    </div>
  );
}

export default ChooseStoryType;
