import { v4 as uuid } from "uuid";
import { store } from "./index";
import actions from "./actions";
import { listen } from "../utils/socket";
import { ServerMessage } from "../sharedTypes";

let lastDispatchedStoryVersionByStoryId: {
  [K: string]: number | null | undefined;
} = {};

function onStoryChanged(
  type: "LIVE_STORY_STORY_CHANGED" | "STANDARD_STORY_STORY_CHANGED"
) {
  return (message: ServerMessage) => {
    if (message.type !== type) return;

    const lastDispatchedStoryVersion =
      lastDispatchedStoryVersionByStoryId[message.payload.id];

    if (
      lastDispatchedStoryVersion !== null &&
      lastDispatchedStoryVersion !== undefined &&
      message.payload.version <= lastDispatchedStoryVersion
    ) {
      return;
    }

    lastDispatchedStoryVersionByStoryId[message.payload.id] =
      message.payload.version;

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
