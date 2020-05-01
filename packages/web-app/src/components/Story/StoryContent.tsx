import React from "react";
import { makeStyles, Theme, createStyles } from "@material-ui/core/styles";
import useStoryHistory from "../../hooks/useStoryHistory";
import { InjectedLiveStoryEditorProps } from "../../hoc/withLiveStoryEditor";
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
      borderRight: `1px solid ${theme.palette.secondary.main}`,
      marginLeft: 2,
      animation: "flash linear 1s infinite",
    },
    textArea: {
      position: "absolute",
      left: -9999999,
      width: 200,
      height: 200,
    },
  })
);

interface Props {
  storyId: string;
  editingSession: Session | null;
  textAreaProps: InjectedLiveStoryEditorProps["textAreaProps"];
  canCurrentUserEdit: boolean;
}

function StoryContent({
  storyId,
  editingSession,
  canCurrentUserEdit,
  textAreaProps,
}: Props) {
  const sessions = useStoryHistory(storyId);
  const classes = useStyles();

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
      {paragraphs.map((text, i) => (
        <p key={i}>
          {text}
          {paragraphs.length - 1 === i && canCurrentUserEdit && (
            <span className={classes.cursor} />
          )}
        </p>
      ))}
      <textarea className={classes.textArea} {...textAreaProps} />
    </>
  );
}

export default React.memo(StoryContent);
