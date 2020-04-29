import ReduxTypes from "ReduxTypes";

export const selectUser = (userId: string) => (state: ReduxTypes.RootState) => {
  const user = state.usersById[userId];

  if (!user) return null;

  const currentUser = state.currentUser;

  if (user.id !== currentUser.id) return user;

  return {
    ...user,
    ...currentUser,
  };
};
