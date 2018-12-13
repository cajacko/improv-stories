// @flow

export const types = `
  scalar StoryID
  scalar StoryItemID

  type StoryItem {
    id: StoryID!
    userName: String!
    text: String!
  }

  type Story {
    id: StoryID!
    storyItems: [StoryItem]
  }

  type SetStoryItemResponse {
    success: Boolean!
    canRetry: Boolean
    storyItems: [StoryItem]!
  }
`;

export const query = `
  getStoryItems(id: StoryID): [StoryItem]!
`;

export const mutation = `
  setStoryItem(storyID: StoryID, storyItemID: StoryItemID, text: String, userName: String): SetStoryItemResponse
`;
