// @flow

/**
 * Does the last story item id submitted by the client match the last one in
 * the database. If not, then the user is submitting an out of date entry. So
 * fail it.
 */
const doesLastStoryIDMatch = (storyItems, userLastStoryItemID) => {
  if (!storyItems.length) return true;

  const lastStoryItemID = storyItems[storyItems.length - 1];

  if (!lastStoryItemID) return true;

  return userLastStoryItemID === lastStoryItemID;
};

/**
 * Does the last saved story item user match the one currently adding a new
 * entry
 */
const wasThisUserLastUser = (storyItemsByID, lastStoryItemID, userName) => {
  if (!lastStoryItemID) return false;

  const story = storyItemsByID[lastStoryItemID];

  if (!story) throw new Error('Could not get a story item at the given id');

  return story.userName === userName;
};

/**
 * Return an error for the new story item if there is an error. Checks:
 * - The story item id has not already been added
 * - The last story item the user wrote against matches the last one saved here
 * - This user was not the last author
 */
const getStoryEntryError = (
  { storyItems, storyItemsByID },
  { userName, userLastStoryItemID, id }
) => {
  if (storyItems.includes(id)) {
    return { error: 'STORY_ITEM_ALREADY_ADDED' };
  }

  if (!doesLastStoryIDMatch(storyItems, userLastStoryItemID)) {
    return { error: 'LAST_STORY_ID_MISMATCH' };
  }

  if (wasThisUserLastUser(storyItemsByID, userLastStoryItemID, userName)) {
    return { error: 'WAS_LAST_USER' };
  }

  return { error: null };
};

/**
 * Create a blank story with the given id
 */
const createNewStory = (db, storyID) =>
  db.set(['storiesByID', storyID], {
    id: storyID,
    storyItems: [],
    storyItemsByID: {},
  });

export const Query = {
  getStoryItems: ({ id }: { id: string }, db) =>
    db
      .get(['storiesByID', id])
      .then((story) => {
        if (story) return story;

        // Here we are creating the story, in future we will throw here instead
        return createNewStory(db, id);
      })
      .then((story) => {
        if (!story.storyItems) return [];

        return story.storyItems.map(storyItemID => story.storyItemsByID[storyItemID]);
      }),
};

export const Mutation = {
  setStoryItem: (
    {
      storyID, storyItemID, text, userName, lastStoryItemID,
    },
    db
  ) =>
    db
      .get(['storiesByID', storyID])
      .then((story) => {
        if (story) return story;

        // Here we are creating the story, in future we will throw here instead
        return createNewStory(db, storyID);
      })
      .then((story) => {
        const storyItem = {
          id: storyItemID,
          text,
          userName,
        };

        const newStoryItems = story.storyItems || [];
        const storyItemsByID = Object.assign({}, story.storyItemsByID || {});

        const { error } = getStoryEntryError(
          { storyItems: newStoryItems, storyItemsByID },
          { userName, userLastStoryItemID: lastStoryItemID, id: storyItem.id }
        );

        if (error) {
          return Query.getStoryItems({ id: storyID }, db).then(storyItems => ({
            error,
            storyItems,
          }));
        }

        newStoryItems.push(storyItem.id);

        storyItemsByID[storyItemID] = storyItem;

        return db
          .update(['storiesByID', storyID], {
            storyItems: newStoryItems,
            storyItemsByID,
          })
          .then(() => Query.getStoryItems({ id: storyID }, db))
          .then(storyItems => ({
            error: null,
            storyItems,
          }));
      }),
};
