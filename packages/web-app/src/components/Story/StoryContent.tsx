import React from "react";
import { makeStyles, Theme, createStyles } from "@material-ui/core/styles";

export interface Props {
  paragraphs?: string[];
  textAreaRef?: React.RefObject<HTMLTextAreaElement>;
  onTextAreaFocus?: () => void;
  onTextAreaBlur?: () => void;
  textAreaValue?: string;
  onTextAreaChange?: (event: React.ChangeEvent<HTMLTextAreaElement>) => void;
  isTextInvisible?: boolean;
  showCursor?: boolean;
  textStyle?: "NORMAL" | "FADED";
  cursorPosition?: "START" | "END";
}

interface StyleProps {
  showCursor: boolean;
  isTextInvisible: boolean;
  textStyle?: Props["textStyle"];
}

const animationKeyframeKey = "storycontent__flash";

const useStyles = makeStyles<Theme, StyleProps>((theme: Theme) =>
  createStyles({
    [`@keyframes ${animationKeyframeKey}`]: {
      "0%": {
        opacity: 1,
      },
      "25%": {
        opacity: 0,
      },
      "75%": {
        opacity: 0,
      },
      "100%": {
        opacity: 1,
      },
    },
    cursor: {
      borderRight: ({ showCursor }) =>
        showCursor ? `1px solid ${theme.palette.secondary.main}` : 0,
      marginLeft: 0,
      animation: `$${animationKeyframeKey} linear 1s infinite`,
    },
    textAreaContainer: {
      position: "relative",
    },
    textArea: {
      position: "absolute",
      left: -9999999,
      width: 200,
      height: 0,
    },
    paragraphText: {
      color: ({ textStyle }) => (textStyle === "FADED" ? "grey" : "initial"),
    },
    paragraph: {
      whiteSpace: "break-spaces",
      opacity: ({ isTextInvisible }) => (isTextInvisible ? 0 : 1),
    },
  })
);

function StoryContent({
  showCursor,
  paragraphs = [],
  textAreaRef,
  textAreaValue,
  onTextAreaBlur,
  onTextAreaFocus,
  onTextAreaChange,
  isTextInvisible,
  textStyle = "NORMAL",
  cursorPosition = "END",
}: Props) {
  const classes = useStyles({
    showCursor: !!showCursor,
    isTextInvisible: !!isTextInvisible,
    textStyle,
  });

  const lastParagraph = paragraphs[paragraphs.length - 1] as string | undefined;

  const autoCapitalize =
    !lastParagraph ||
    lastParagraph.trim() === "" ||
    lastParagraph.trim().endsWith(".");

  return (
    <>
      {paragraphs.map((text, i) => (
        <p key={i} className={classes.paragraph}>
          {cursorPosition === "START" && 0 === i && (
            <span className={classes.cursor} />
          )}
          <span className={classes.paragraphText}>{text}</span>
          {cursorPosition === "END" && paragraphs.length - 1 === i && (
            <span className={classes.cursor} />
          )}
        </p>
      ))}
      {/* Textarea must always be statically rendered and never unmount */}
      <span className={classes.textAreaContainer}>
        <textarea
          className={classes.textArea}
          ref={textAreaRef}
          value={textAreaValue}
          onBlur={onTextAreaBlur}
          onFocus={onTextAreaFocus}
          onChange={onTextAreaChange}
          autoCorrect="off"
          autoCapitalize={autoCapitalize ? "sentences" : "none"}
        />
      </span>
    </>
  );
}

export default React.memo(StoryContent);
