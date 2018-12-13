// @flow

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
  setStoryItem: ({
    storyID, storyItemID, text, userName,
  }, db) =>
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

        newStoryItems.push(storyItem.id);

        const storyItemsByID = Object.assign({}, story.storyItemsByID || {});

        storyItemsByID[storyItemID] = storyItem;

        return db
          .update(['storiesByID', storyID], {
            storyItems: newStoryItems,
            storyItemsByID,
          })
          .then(() => Query.getStoryItems({ id: storyID }, db))
          .then(storyItems => ({
            success: true,
            canRetry: null,
            storyItems,
          }));
      }),
};
