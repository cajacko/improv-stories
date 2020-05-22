import React from "react";
import { makeStyles, Theme, createStyles } from "@material-ui/core/styles";
import StoryEditorContext from "../../context/StoryEditor";

interface Props {
  autoCapitalize: boolean;
  value: string;
  onChange: (value: string) => void;
}

const animationKeyframeKey = "storycontent__flash";

const useStyles = makeStyles<Theme>((theme: Theme) =>
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
      borderRight: `1px solid ${theme.palette.secondary.main}`,
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
  })
);

function StoryEditor({ value, onChange, autoCapitalize }: Props) {
  console.log("StoryEditor");

  const { registerFocusListener, onFocusChange } = React.useContext(
    StoryEditorContext
  );

  const classes = useStyles();

  const textAreaRef = React.useRef<HTMLTextAreaElement>(null);

  const focusOnTextArea = React.useCallback(() => {
    if (!textAreaRef.current) return;
    textAreaRef.current.focus();
  }, [textAreaRef]);

  React.useEffect(() => registerFocusListener(focusOnTextArea), [
    focusOnTextArea,
    registerFocusListener,
  ]);

  const [isFocussed, setIsFocussed] = React.useState(false);

  React.useEffect(() => {
    onFocusChange(isFocussed);
  }, [isFocussed, onFocusChange]);

  React.useEffect(focusOnTextArea, [focusOnTextArea]);

  const onTextAreaChange = React.useCallback(
    (event: React.ChangeEvent<HTMLTextAreaElement>) => {
      onChange(event.target.value);
    },
    [onChange]
  );

  const onTextAreaBlur = React.useCallback(() => setIsFocussed(false), []);
  const onTextAreaFocus = React.useCallback(() => setIsFocussed(true), []);

  return (
    <>
      <span className={classes.cursor} />
      <span className={classes.textAreaContainer}>
        <textarea
          className={classes.textArea}
          ref={textAreaRef}
          value={value}
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

export default StoryEditor;
