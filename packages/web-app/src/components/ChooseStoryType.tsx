import React from "react";
import { useHistory } from "react-router-dom";
import Grid, { GridProps } from "@material-ui/core/Grid";
import StoryTypeCard from "./StoryTypeCard";
import { makeStyles } from "@material-ui/core/styles";
import {
  uniqueNamesGenerator,
  Config,
  adjectives,
  colors,
  animals,
} from "unique-names-generator";

const customConfig: Config = {
  dictionaries: [adjectives, colors, animals],
  separator: "-",
};

const useStyles = makeStyles({
  root: {
    maxWidth: 500,
  },
});

const grid: Partial<GridProps> = {
  xs: 12,
  sm: 6,
};

interface Props {
  onChooseStory?: (storyType: "LIVE" | "STANDARD", id: string) => void;
}

function ChooseStoryType({ onChooseStory }: Props) {
  const classes = useStyles();
  const { push } = useHistory();

  const onLiveStoryClick = React.useCallback(() => {
    const id = uniqueNamesGenerator(customConfig);

    if (onChooseStory) onChooseStory("LIVE", id);
    push(`/story/live/${id}`);
  }, [push, onChooseStory]);

  const onStandardStoryClick = React.useCallback(() => {
    const id = uniqueNamesGenerator(customConfig);

    if (onChooseStory) onChooseStory("STANDARD", id);
    push(`/story/standard/${id}`);
  }, [push, onChooseStory]);

  return (
    <div className={classes.root}>
      <Grid container justify="center" spacing={2}>
        <Grid item {...grid}>
          <StoryTypeCard
            title="Standard Story"
            description="Take it in turns to write a story over a long period of time. When it's your turn you can take your go whenever you like. Perfect for keeping long running stories going over many days."
            onClick={onStandardStoryClick}
          />
        </Grid>
        <Grid item {...grid}>
          <StoryTypeCard
            title="Live Story"
            description="Get online with friends and play in realtime. Write a story in the moment, seeing what people type as their doing it. With the writer changing player every 40 seconds or so."
            onClick={onLiveStoryClick}
          />
        </Grid>
      </Grid>
    </div>
  );
}

export default ChooseStoryType;
