function usePlayingSession() {
  // const isPlayingSession = !!playingSession;

  // const playingSessionUserName = useSelector((state) => {
  //   if (!playingSession) return null;

  //   const user = selectors.usersById.selectUser(state, {
  //     userId: playingSession.session.userId,
  //   });

  //   if (!user) return null;

  //   return user.name;
  // });

  return {
    isPlayingSession: false,
    playingSessionUserName: null,
  };
}

export default usePlayingSession;
