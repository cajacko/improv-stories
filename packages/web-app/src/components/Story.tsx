import React from "react";
import { useParams } from "react-router-dom";
import useAddCurrentUserToStory from "../hooks/useAddCurrentUserToStory";
import useLiveStoryEditor from "../hooks/useLiveStoryEditor";
import useStoryUsers from "../hooks/useStoryUsers";

function Story() {
  const { storyId } = useParams<{ storyId: string }>();
  useAddCurrentUserToStory(storyId);
  const users = useStoryUsers(storyId);
  const {
    onTextChange,
    text,
    currentUserCanEdit,
    currentlyEditingUser,
  } = useLiveStoryEditor(storyId);

  return (
    <div>
      <h1>Story Baby</h1>
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
    </div>
  );
}

export default Story;
