import { Story } from "../../sharedTypes";
import { store } from "../index";
import { selectStorySessions } from "./selectors";
import { setStory } from "../storiesById/actions";
import transformServerSessionToClientSession from "../../utils/transformServerSessionToClientSession";
import { insertAllSessionTypes } from "../sessionIdsByStoryId/transforms";

export const setStoryWithSessionIds = (story: Story) => {
  const sessions =
    selectStorySessions(store.getState(), { storyId: story.id }) || [];

  const activeSession = transformServerSessionToClientSession(
    story.activeSession
  );

  const lastSession = transformServerSessionToClientSession(story.lastSession);

  return setStory({
    story,
    sessionSortIds: insertAllSessionTypes(
      undefined,
      sessions,
      activeSession,
      lastSession
    ),
  });
};
