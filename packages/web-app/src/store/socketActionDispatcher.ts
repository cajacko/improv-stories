import { v4 as uuid } from "uuid";
import { store } from "./index";
import actions from "./actions";
import { listen } from "../utils/socket";
import { ServerMessage } from "../sharedTypes";

let lastDispatchedStoryVersion: number | null = null;

function onStoryChanged(
  type: "LIVE_STORY_STORY_CHANGED" | "STANDARD_STORY_STORY_CHANGED"
) {
  return (message: ServerMessage) => {
    if (message.type !== type) return;

    if (
      lastDispatchedStoryVersion !== null &&
      message.payload.version <= lastDispatchedStoryVersion
    ) {
      return;
    }

    lastDispatchedStoryVersion = message.payload.version;

    store.dispatch(actions.misc.setStoryWithSessionIds(message.payload));
  };
}

listen(
  "LIVE_STORY_STORY_CHANGED",
  uuid(),
  onStoryChanged("LIVE_STORY_STORY_CHANGED")
);

listen(
  "STANDARD_STORY_STORY_CHANGED",
  uuid(),
  onStoryChanged("STANDARD_STORY_STORY_CHANGED")
);
