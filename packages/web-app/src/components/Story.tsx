import React from "react";
import useAddCurrentUserToStory from "../hooks/useAddCurrentUserToStory";
import withLiveStoryEditor, {
  InjectedLiveStoryEditorProps,
} from "../hoc/withLiveStoryEditor";
import useStoryUsers from "../hooks/useStoryUsers";
import useStoryHistory from "../hooks/useStoryHistory";

interface OwnProps {
  storyId: string;
}

interface Props extends OwnProps, InjectedLiveStoryEditorProps {}

function Story({
  storyId,
  currentUserCanEdit,
  currentlyEditingUser,
  text,
  onTextChange,
  countDownTimer,
}: Props) {
  useAddCurrentUserToStory(storyId);
  const users = useStoryUsers(storyId);
  const entries = useStoryHistory(storyId);

  return (
    <div>
      <h1>Story Baby</h1>
      <div>
        {entries.map((entry) => (
          <p key={entry.id}>{entry.finalText}</p>
        ))}
      </div>
      <p>
        {currentUserCanEdit
          ? "Edit!"
          : `${
              currentlyEditingUser ? currentlyEditingUser.name : "Someone else"
            } is editing`}
      </p>
      {users && (
        <ul>
          {users.map(({ id }) => (
            <li key={id}>{id}</li>
          ))}
        </ul>
      )}
      <textarea value={text} onChange={onTextChange}>
        {text}
      </textarea>
      <p>Time Left: {countDownTimer}</p>
    </div>
  );
}

export default withLiveStoryEditor<OwnProps>(Story);
