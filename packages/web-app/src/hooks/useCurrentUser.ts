import React from "react";
import userId from "../config/userId";
import useUser from "./useUser";

function useCurrentUser() {
  const useUserProps = useUser(userId);

  const [hasTriedToSave, setHasTriedToSave] = React.useState(false);

  const [nameInputValue, setNameInputValue] = React.useState(
    useUserProps.user ? useUserProps.user.name : ""
  );

  let inputErrorMessage: string | null = null;

  if (nameInputValue === "") {
    inputErrorMessage = "No name set";
  } else if (nameInputValue.length < 3) {
    inputErrorMessage = "Name must be longer than 3 characters";
  }

  function saveNameInput() {
    if (!hasTriedToSave) setHasTriedToSave(true);

    useUserProps.mutate({
      variables: {
        userId,
        name: nameInputValue
      }
    });
  }

  const disableSaveName = !!inputErrorMessage;

  return {
    ...useUserProps,
    nameInputValue,
    setNameInputValue,
    saveNameInput: disableSaveName ? undefined : saveNameInput,
    disableSaveName,
    inputErrorMessage: hasTriedToSave && inputErrorMessage
  };
}

export default useCurrentUser;
