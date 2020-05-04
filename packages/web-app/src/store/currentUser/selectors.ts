import ReduxTypes from "ReduxTypes";

export const selectCurrentUser = ({ currentUser }: ReduxTypes.RootState) =>
  currentUser;
