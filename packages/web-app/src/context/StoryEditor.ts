import React from "react";

type Callback = () => void;

export interface Context {
  onFocusChange: (value: boolean) => void;
  registerFocusListener: (callback: Callback) => () => void;
}

const defaultValue: Context = {
  onFocusChange: () => {},
  registerFocusListener: () => () => {},
};

const StoryEditor = React.createContext<Context>(defaultValue);

export default StoryEditor;
