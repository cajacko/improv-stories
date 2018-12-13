// @flow

/**
 * Get the story items for a given story ID
 */
export const getStoryItems = (storyID: string) => ({
  query: `
    query GetStoryItems($id: StoryID) {
      getStoryItems(id: $id) {
        id
        text
        userName
      }
    }
  `,
  vars: { id: storyID },
});

/**
 * Set a story item for a given story
 */
export const setStoryItem = ({
  storyID,
  storyItemID,
  text,
  userName,
}: {
  storyID: string,
  storyItemID: string,
  text: string,
  userName: string,
}) => ({
  mutation: `
    mutation SetStoryItem($storyID: StoryID, $storyItemID: StoryItemID, $text: String, $userName: String) {
      setStoryItem(storyID: $storyID, storyItemID: $storyItemID, text: $text, userName: $userName) {
        success
        canRetry
        storyItems {
          id
          text
          userName
        }
      }
    }
  `,
  vars: {
    storyID,
    storyItemID,
    text,
    userName,
  },
});
