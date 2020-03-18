import React from "react";
import useCurrentUser from "../hooks/useCurrentUser";

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

  function handleOnNameChange(e: React.ChangeEvent<HTMLInputElement>) {
    setNameInputValue(e.target.value);
  }

  function handleOnSaveName(e: React.ChangeEvent | React.FormEvent) {
    e.preventDefault();
    if (saveNameInput) saveNameInput();
  }

  return (
    <form onSubmit={handleOnSaveName}>
      <p>Fetch: {queryStatus.type}</p>
      <p>Saved: {(user && user.name) || "N/A"}</p>
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
  );
}

export default Toolbar;
