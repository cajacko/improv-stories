import React from "react";
import { StoryFetchStatus } from "../store/storyFetchStateByStoryId/types";

function useStoryInitScroll(
  fetchStatus: StoryFetchStatus | null,
  scrollRef: React.RefObject<HTMLDivElement>,
  doesStoryHaveContent: boolean
) {
  const [hasScrolled, setHasScrolled] = React.useState(false);

  React.useEffect(() => {
    // This happens when we click on a new story
    if (fetchStatus === null && hasScrolled && scrollRef.current) {
      scrollRef.current.scrollTop = 0;
      setHasScrolled(false);
      return;
    }

    // We've either loaded data or got an error and there's no content, so we want to be at the top
    // of the page. Set scrolled to true to show this.
    if (fetchStatus !== null && !doesStoryHaveContent) {
      setHasScrolled(true);
      return;
    }

    // The timeout gives the scroll div time to reset it's height with the content
    const timeout = setTimeout(() => {
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

    return () => {
      clearTimeout(timeout);
    };
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
