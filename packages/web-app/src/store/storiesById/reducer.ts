import { createReducer } from "typesafe-actions";
import actions from "../actions";
import { StoriesByIdState, Story } from "./types";

const defaultState: StoriesByIdState = {};

const reducer = createReducer<StoriesByIdState>(defaultState).handleAction(
  actions.usersById.setUsers,
  (state, { payload }) => {
    const newState = { ...state };

    const newUserIdsByStoryId: { [K: string]: undefined | string[] } = {};

    payload.users.forEach((user) => {
      const storyId = user.broadcastGroupId;

      if (!storyId) return;

      const userIds = newUserIdsByStoryId[storyId] || [];

      userIds.push(user.id);

      newUserIdsByStoryId[storyId] = userIds;
    });

    let hasChanged = false;

    // Delete stories without online users
    Object.keys(state).forEach((storyId) => {
      const story = state[storyId];

      if (!story) return;
      if (newUserIdsByStoryId[storyId]) return;

      hasChanged = true;
      delete newState[storyId];
    });

    Object.keys(newUserIdsByStoryId).forEach((storyId) => {
      const newUserIds = newUserIdsByStoryId[storyId];

      if (!newUserIds) return;

      const story = state[storyId];

      if (!story) {
        hasChanged = true;

        const newStory: Story = {
          id: storyId,
          onlineUserIds: newUserIds,
        };

        newState[storyId] = newStory;

        return;
      }

      const oldUserIds = story.onlineUserIds;

      const hasDifferentIds =
        // If the length is different we definitely have changes
        newUserIds.length !== oldUserIds.length ||
        // Otherwise the length is the same so all old id's should be in the new array if the same
        oldUserIds.some((userId) => !newUserIds.includes(userId));

      if (!hasDifferentIds) return;

      const newStory: Story = {
        ...story,
        onlineUserIds: newUserIds,
      };

      hasChanged = true;
      newState[storyId] = newStory;
    });

    return hasChanged ? newState : state;
  }
);

export default reducer;
