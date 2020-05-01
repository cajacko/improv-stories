import React from "react";
import { makeStyles, Theme, createStyles } from "@material-ui/core/styles";
import useStoryHistory from "../../hooks/useStoryHistory";
import { Session } from "../../store/sessionsById/types";

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
  const sessions = useStoryHistory(storyId);
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

  const cursor = (
    <span className={classes.cursor}>
      <textarea
        className={classes.textArea}
        ref={textAreaRef}
        value={textAreaValue}
        onBlur={onTextAreaBlur}
        onFocus={onTextAreaFocus}
        onChange={onTextAreaChange}
      />
    </span>
  );

  return (
    <>
      {!paragraphs.length && <p>{cursor}</p>}
      {paragraphs.map((text, i) => (
        <p key={i}>
          {text}
          {paragraphs.length - 1 === i && canCurrentUserEdit && cursor}
        </p>
      ))}
    </>
  );
}

export default React.memo(StoryContent);
