import React from "react";
import { StoryFetchStatus } from "../../store/storyFetchStateByStoryId/types";

function useStoryInitScroll(
  fetchStatus: StoryFetchStatus | null,
  scrollRef: React.RefObject<HTMLDivElement>,
  doesStoryHaveContent: boolean
) {
  const [hasScrolled, setHasScrolled] = React.useState(false);

  React.useEffect(() => {
    if (fetchStatus === null && hasScrolled && scrollRef.current) {
      scrollRef.current.scrollTop = 0;
      return;
    }

    // The timeout gives the scroll div time to reset it's height with the content
    setTimeout(() => {
      if (hasScrolled) return;
      if (fetchStatus !== "FETCHED_NOW_LISTENING") return;
      if (!scrollRef.current) return;
      if (!doesStoryHaveContent) return;

      const scrollTop =
        scrollRef.current.scrollHeight -
        window.innerHeight -
        window.innerHeight / 2;

      scrollRef.current.scrollTop = scrollTop;

      setHasScrolled(true);
    }, 500);
  }, [
    fetchStatus,
    hasScrolled,
    setHasScrolled,
    doesStoryHaveContent,
    scrollRef,
  ]);

  return hasScrolled;
}

export default useStoryInitScroll;
