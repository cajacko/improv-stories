import React from "react";
import { makeStyles, Theme, createStyles } from "@material-ui/core/styles";

interface StyleProps {
  isTextInvisible?: boolean;
  textStyle?: "FADED" | "NORMAL";
}

const useStyles = makeStyles<Theme, StyleProps>((theme: Theme) =>
  createStyles({
    text: {
      color: ({ textStyle }) => (textStyle === "FADED" ? "grey" : "initial"),
      whiteSpace: "break-spaces",
      opacity: ({ isTextInvisible }) => (isTextInvisible ? 0 : 1),
    },
  })
);

interface Props {
  text: string;
  isTextInvisible?: boolean;
  textStyle?: "FADED" | "NORMAL";
}

function StoryText({ text, isTextInvisible, textStyle }: Props) {
  const classes = useStyles({
    isTextInvisible,
    textStyle,
  });

  const [lines, setLines] = React.useState(text.split("\n"));

  React.useEffect(() => setLines(text.split("\n")), [text]);

  let wasEmptyLine = false;

  return (
    <>
      {lines.map((line, i) => {
        const isEmptyLine = line === "";
        const shouldAddLineBreak = !wasEmptyLine && (i > 0 || isEmptyLine);

        wasEmptyLine = isEmptyLine;

        return (
          <React.Fragment key={i}>
            {shouldAddLineBreak && (
              <>
                <br />
                <br />
              </>
            )}
            <span className={classes.text}>{line}</span>
          </React.Fragment>
        );
      })}
    </>
  );
}

export default React.memo(StoryText);
