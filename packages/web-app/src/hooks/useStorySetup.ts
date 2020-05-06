import useAddCurrentUserToStory from "./useAddCurrentUserToStory";
import useStoryFromDatabase from "./useStoryFromDatabase";
import useSetUserDetails from "./useSetUserDetails";

function useStorySetup(storyId: string) {
  useSetUserDetails();
  useAddCurrentUserToStory(storyId);
  useStoryFromDatabase(storyId);
}

export default useStorySetup;
