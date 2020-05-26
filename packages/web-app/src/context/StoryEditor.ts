import React from "react";

type Callback = () => void;

export interface Context {
  onFocusChange: (value: boolean) => void;
  registerFocusListener: (callback: Callback) => () => void;
  isTextAreaFocussed: boolean;
  focusOnTextArea: () => void;
}

const defaultValue: Context = {
  onFocusChange: () => {},
  registerFocusListener: () => () => {},
  isTextAreaFocussed: false,
  focusOnTextArea: () => {},
};

const StoryEditor = React.createContext<Context>(defaultValue);

export default StoryEditor;
