import { store } from "./index";
import actions from "./actions";
import { listen } from "../utils/socket";

listen("BROADCAST_GROUP_USERS", (message) => {
  if (message.type !== "BROADCAST_GROUP_USERS") return;

  store.dispatch(
    actions.storiesById.setStoryUsers({
      userIds: message.payload.userIds,
      storyId: message.payload.broadcastGroupId,
    })
  );
});
