import React from "react";
import useCurrentUser from "../hooks/useCurrentUser";
import useStoryUsers from "../hooks/useStoryUsers";
import storyId from "../config/storyId";
import User from "./User";
import userId from "../config/userId";

function Toolbar() {
  const {
    nameInputValue,
    setNameInputValue,
    saveNameInput,
    disableSaveName,
    inputErrorMessage,
    queryStatus,
    mutationStatus,
    user
  } = useCurrentUser();

  const { storyUsers, addStoryUser, removeStoryUser } = useStoryUsers(storyId);

  const hasJoinedStory = storyUsers && storyUsers.users.includes(userId);

  function handleOnNameChange(e: React.ChangeEvent<HTMLInputElement>) {
    setNameInputValue(e.target.value);
  }

  function handleOnSaveName(
    e: React.ChangeEvent | React.FormEvent | React.MouseEvent
  ) {
    e.preventDefault();
    if (saveNameInput) saveNameInput();
  }

  function handleOnJoinStory(e: React.MouseEvent) {
    e.preventDefault();

    if (user) addStoryUser({ variables: { storyId, userId: user.userId } });
  }

  function handleOnLeaveStory(e: React.MouseEvent) {
    e.preventDefault();

    if (user) removeStoryUser({ variables: { storyId, userId: user.userId } });
  }

  const name = user && user.name;

  return (
    <div>
      <form onSubmit={handleOnSaveName}>
        <p>Fetch: {queryStatus.type}</p>
        <p>Saved: {name || "N/A"}</p>
        <input
          type="text"
          value={nameInputValue}
          onChange={handleOnNameChange}
          placeholder="Your name"
        />
        <button onClick={handleOnSaveName} disabled={disableSaveName}>
          Save Name
        </button>
        {inputErrorMessage && <p>{inputErrorMessage}</p>}
        <p>Set: {mutationStatus.type}</p>
      </form>
      {name && (
        <button
          onClick={hasJoinedStory ? handleOnLeaveStory : handleOnJoinStory}
        >
          {hasJoinedStory ? "Leave" : "Join"} story
        </button>
      )}
      {storyUsers &&
        storyUsers.users.map(storyUserId => (
          <User key={storyUserId} userId={storyUserId} />
        ))}
    </div>
  );
}

export default Toolbar;
