import React from "react";
import { v4 as uuid } from "uuid";
import { Context } from "../context/StoryEditor";

interface UseStoryEditor extends Context {
  isTextAreaFocussed: boolean;
  focusOnTextArea: () => void;
}

type Callback = () => void;
type State = { [K: string]: Callback };

type Action =
  | { type: "SET_LISTENER"; payload: { id: string; callback: Callback } }
  | { type: "REMOVE_LISTENER"; payload: string };

function reducer(state: State, action: Action): State {
  console.log("reducer", state, action);
  switch (action.type) {
    case "SET_LISTENER":
      return { ...state, [action.payload.id]: action.payload.callback };
    case "REMOVE_LISTENER":
      const newState = { ...state };
      delete newState[action.payload];
      return newState;
    default:
      return state;
  }
}

function useStoryEditor(): UseStoryEditor {
  const [focusListeners, dispatch] = React.useReducer(reducer, {});
  const [isTextAreaFocussed, setIsTextAreaFocussed] = React.useState(false);

  const registerFocusListener = React.useCallback(
    (callback: Callback) => {
      const id = uuid();

      dispatch({ type: "SET_LISTENER", payload: { id, callback } });

      return () => {
        dispatch({ type: "REMOVE_LISTENER", payload: id });
      };
    },
    [dispatch]
  );

  const focusOnTextArea = React.useCallback(() => {
    Object.values(focusListeners).forEach((callback) => callback());
  }, [focusListeners]);

  return {
    registerFocusListener,
    onFocusChange: setIsTextAreaFocussed,
    isTextAreaFocussed,
    focusOnTextArea,
  };
}

export default useStoryEditor;
