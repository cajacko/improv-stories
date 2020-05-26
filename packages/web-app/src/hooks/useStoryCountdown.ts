import React from "react";
import { v4 as uuid } from "uuid";
import selectors from "../store/selectors";
import { Session } from "../store/sessionsById/types";
import { useSelector } from "react-redux";

type UseStoryCountdownState = null | {
  secondsLeft: number;
  totalSeconds: number;
};

let callbacks: { [K: string]: () => void } = {};

setInterval(
  () => Object.values(callbacks).forEach((callback) => callback()),
  1000
);

function getState(activeSession: Session | null): UseStoryCountdownState {
  if (!activeSession) return null;

  const dateStarted = new Date(activeSession.dateStarted).getTime();
  const dateWillFinish = new Date(activeSession.dateWillFinish).getTime();

  // FIXME: There's a bug where some users computer clocks are not accurate to our server so the
  // time they get is out. We need to get the current time from our server somehow?
  const now = new Date().getTime();
  const diff = dateWillFinish - now;
  let secondsLeft: number | null = Math.floor(diff / 1000);
  const totalSeconds = Math.ceil((dateWillFinish - dateStarted) / 1000);

  if (secondsLeft < 0) return null;

  return {
    secondsLeft,
    totalSeconds,
  };
}

function isStateDifferent(
  state: UseStoryCountdownState,
  newState: UseStoryCountdownState,
  onlyReturnHasCountdown: boolean
) {
  if (onlyReturnHasCountdown) {
    return !!newState !== !!state;
  }

  if (!newState && state === newState) return false;

  if (
    newState &&
    state &&
    newState.secondsLeft === state.secondsLeft &&
    newState.totalSeconds === state.totalSeconds
  ) {
    return false;
  }

  return true;
}

function useStoryCountdown(
  storyId: string,
  onlyReturnHasCountdown?: false
): UseStoryCountdownState;

function useStoryCountdown(
  storyId: string,
  onlyReturnHasCountdown: true
): boolean;

function useStoryCountdown(storyId: string, onlyReturnHasCountdown = false) {
  const callbackId = React.useMemo(uuid, []);

  const activeSession = useSelector((state) =>
    selectors.misc.selectActiveStorySession(state, { storyId })
  );

  const [state, setState] = React.useState<UseStoryCountdownState>(
    getState(activeSession)
  );

  const onIntervalTick = React.useCallback(() => {
    const newState = getState(activeSession);

    if (!isStateDifferent(state, newState, onlyReturnHasCountdown)) return;

    setState(newState);
  }, [activeSession, state, onlyReturnHasCountdown]);

  React.useEffect(onIntervalTick, [onIntervalTick]);

  React.useEffect(() => {
    callbacks[callbackId] = onIntervalTick;

    return () => {
      delete callbacks[callbackId];
    };
  }, [onIntervalTick, callbackId]);

  const value = activeSession ? state : null;

  return onlyReturnHasCountdown ? !!value : value;
}

export default useStoryCountdown;
