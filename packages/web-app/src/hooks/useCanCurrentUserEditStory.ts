import { useSelector } from "react-redux";
import selectors from "../store/selectors";

function useCanCurrentUserEditStory(
  storyId: string,
  storyType: "LIVE" | "STANDARD"
) {
  const activeSession = useSelector((state) =>
    selectors.misc.selectActiveStorySession(state, { storyId })
  );

  const canCurrentUserEdit = useSelector((state) =>
    selectors.misc.selectCanCurrentUserEdit(state, {
      storyId,
      storyType,
      sessionId: activeSession ? activeSession.id : null,
      isPlayingASession: false,
    })
  );

  return canCurrentUserEdit;
}

export default useCanCurrentUserEditStory;
