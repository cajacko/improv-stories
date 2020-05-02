import React from "react";
import { makeStyles, Theme, createStyles } from "@material-ui/core/styles";
import { Session } from "../../store/sessionsById/types";
import { useSelector } from "react-redux";
import selectors from "../../store/selectors";

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    "@keyframes flash": {
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
      borderRight: (canCurrentUserEdit) =>
        canCurrentUserEdit ? `1px solid ${theme.palette.secondary.main}` : 0,
      marginLeft: 2,
      animation: "flash linear 1s infinite",
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

interface Props {
  storyId: string;
  editingSession: Session | null;
  canCurrentUserEdit: boolean;
  textAreaRef: React.RefObject<HTMLTextAreaElement>;
  onTextAreaFocus: () => void;
  onTextAreaBlur: () => void;
  textAreaValue: string;
  onTextAreaChange: (event: React.ChangeEvent<HTMLTextAreaElement>) => void;
}

function StoryContent({
  storyId,
  editingSession,
  canCurrentUserEdit,
  textAreaRef,
  textAreaValue,
  onTextAreaBlur,
  onTextAreaFocus,
  onTextAreaChange,
}: Props) {
  const sessions =
    useSelector(selectors.misc.selectStorySessions(storyId)) || [];
  const classes = useStyles(canCurrentUserEdit);

  const editing = editingSession && {
    id: editingSession.id,
    text: editingSession.finalEntry,
  };

  let didAddEditingSession = false;

  let combinedSessions = sessions.reduce((acc, { finalEntry, id }) => {
    if (editing && editing.id === id) {
      didAddEditingSession = true;
      return `${acc}${editing.text}`;
    }

    return `${acc}${finalEntry}`;
  }, "");

  if (!didAddEditingSession && editing) {
    combinedSessions = `${combinedSessions}${editing.text}`;
  }

  const paragraphs = combinedSessions.split("\n").filter((text) => text !== "");

  return (
    <>
      {!paragraphs.length && (
        <p>
          <span className={classes.cursor} />
        </p>
      )}
      {paragraphs.map((text, i) => (
        <p key={i}>
          {text}
          {paragraphs.length - 1 === i && canCurrentUserEdit && (
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
        />
      </span>
    </>
  );
}

export default React.memo(StoryContent);
