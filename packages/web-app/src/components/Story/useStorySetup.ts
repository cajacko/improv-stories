import useAddCurrentUserToStory from "../../hooks/useAddCurrentUserToStory";
import useStoryHistory from "../../hooks/useStoryHistoryListener";
import useSetUserDetails from "../../hooks/useSetUserDetails";

function useStorySetup(storyId: string) {
  useSetUserDetails();
  useAddCurrentUserToStory(storyId);
  useStoryHistory(storyId);
}

export default useStorySetup;
