import { createReducer } from "typesafe-actions";
import actions from "../actions";
import { EntriesByIdState } from "./types";

const defaultState: EntriesByIdState = {};

const reducer = createReducer<EntriesByIdState>(defaultState).handleAction(
  actions.entriesById.setStoryEntries,
  (state, { payload }) => {
    const newState = { ...state };

    payload.entries.forEach((entry) => {
      newState[entry.id] = entry;
    });

    return newState;
  }
);

export default reducer;
