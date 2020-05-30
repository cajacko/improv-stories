import React from "react";
import StoryText from "./StoryText";

function StoryTutorialText({
  text,
  isTextInvisible,
  isFaded,
}: {
  text: string;
  isFaded?: boolean;
  isTextInvisible?: boolean;
}) {
  return (
    <StoryText
      text={text}
      textStyle={!!isFaded ? "FADED" : undefined}
      isTextInvisible={isTextInvisible}
    />
  );
}

export default React.memo(StoryTutorialText);
