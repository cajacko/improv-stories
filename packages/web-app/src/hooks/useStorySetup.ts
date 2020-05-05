import useAddCurrentUserToStory from "./useAddCurrentUserToStory";
import useStoryHistory from "./useStoryHistoryListener";
import useSetUserDetails from "./useSetUserDetails";

function useStorySetup(storyId: string) {
  useSetUserDetails();
  useAddCurrentUserToStory(storyId);
  useStoryHistory(storyId);
}

export default useStorySetup;
