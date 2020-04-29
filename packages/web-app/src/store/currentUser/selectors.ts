import ReduxTypes from "ReduxTypes";

export const selectCurrentUser = (state: ReduxTypes.RootState) =>
  state.currentUser;
