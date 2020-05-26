import React from "react";

export interface Context {
  playingStorySessionId: string | null;
  playStorySession: (sessionId: string) => void;
  stopPlayingStorySession: (sessionId: string) => void;
}

const defaultValue: Context = {
  playingStorySessionId: null,
  stopPlayingStorySession: () => {},
  playStorySession: () => {},
};

const PlayingStorySession = React.createContext<Context>(defaultValue);

export default PlayingStorySession;
