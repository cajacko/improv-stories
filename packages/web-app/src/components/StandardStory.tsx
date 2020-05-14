import React from "react";
import { StoryOwnProps } from "../components/Story/types";
import StoryContent from "./Story/StoryContent";
import { getStandardStoryTutorialText } from "../utils/getTutorialText";

function StandardStory(props: StoryOwnProps) {
  return (
    <StoryContent
      showCursor
      cursorPosition="START"
      paragraphs={getStandardStoryTutorialText(window.location.href)}
      textStyle="FADED"
    />
  );
}

export default StandardStory;
