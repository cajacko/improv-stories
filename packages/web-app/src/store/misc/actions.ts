import { Story } from "../../sharedTypes";
import { store } from "../index";
import { selectStorySessions } from "./selectors";
import { setStory } from "../storiesById/actions";
import transformServerSessionToClientSession from "../../utils/transformServerSessionToClientSession";
import sortSessions from "../../utils/sortSessions";

export const setStoryWithSessionIds = (story: Story) => {
  const sessions =
    selectStorySessions(store.getState(), { storyId: story.id }) || [];

  const activeSession = transformServerSessionToClientSession(
    story.activeSession
  );
  const lastSession = transformServerSessionToClientSession(story.lastSession);

  if (activeSession) sessions.push(activeSession);
  if (lastSession) sessions.push(lastSession);

  const uniqueSessionIds: string[] = [];

  const sessionIds = sortSessions(sessions)
    .map(({ id }) => id)
    .filter((id) => {
      if (uniqueSessionIds.includes(id)) return false;

      uniqueSessionIds.push(id);

      return true;
    });

  return setStory({
    story,
    sessionIds: sessionIds.length < 1 ? undefined : sessionIds,
  });
};
