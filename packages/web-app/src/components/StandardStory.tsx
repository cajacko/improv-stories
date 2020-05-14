import React from "react";
import Button from "@material-ui/core/Button";
import { makeStyles, Theme, createStyles } from "@material-ui/core/styles";
import { StoryOwnProps } from "../components/Story/types";
import StoryContent from "./Story/StoryContent";
import { getStandardStoryTutorialText } from "../utils/getTutorialText";

const useStyles = makeStyles<Theme>((theme: Theme) =>
  createStyles({
    container: {
      flex: 1,
      display: "flex",
      justifyContent: "center",
      overflow: "auto",
    },
  })
);

function StandardStory(props: StoryOwnProps) {
  const [text, setText] = React.useState("");
  const textAreaRef = React.useRef<HTMLTextAreaElement>(null);
  const [isFocussed, setIsFocussed] = React.useState(false);
  const classes = useStyles();

  const onTextAreaChange = React.useCallback(
    (event: React.ChangeEvent<HTMLTextAreaElement>) => {
      setText(event.target.value);
    },
    []
  );

  const onTakeTurnClick = React.useCallback(() => {
    if (!textAreaRef.current) return;

    textAreaRef.current.focus();
  }, [textAreaRef]);

  const onTextAreaBlur = React.useCallback(() => {
    setIsFocussed(false);
  }, []);

  const onTextAreaFocus = React.useCallback(() => {
    setIsFocussed(true);
  }, []);

  const showTutorialContent = text === "";

  const paragraphs = showTutorialContent
    ? getStandardStoryTutorialText(window.location.href)
    : text.split("\n");

  return (
    <div className={classes.container}>
      <StoryContent
        showCursor
        cursorPosition={showTutorialContent ? "START" : "END"}
        paragraphs={paragraphs}
        textStyle={showTutorialContent ? "FADED" : "NORMAL"}
        onTextAreaChange={onTextAreaChange}
        textAreaRef={textAreaRef}
        onTextAreaBlur={onTextAreaBlur}
        onTextAreaFocus={onTextAreaFocus}
      >
        <>
          {!isFocussed && (
            <Button
              variant="contained"
              color="secondary"
              onClick={onTakeTurnClick}
            >
              Take Turn
            </Button>
          )}
        </>
      </StoryContent>
    </div>
  );
}

export default StandardStory;
