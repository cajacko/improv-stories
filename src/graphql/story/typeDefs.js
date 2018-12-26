// @flow

export const types = `
  scalar StoryID
  scalar StoryItemID

  type StoryItem {
    id: StoryID!
    userName: String!
    text: String!
  }

  type StoryOverview {
    id: StoryID!
    title: String
  }

  type Story {
    id: StoryID!
    title: String
    storyItems: [StoryItem]
  }

  type SetStoryItemResponse {
    error: String
    storyItems: [StoryItem]!
  }

  type SetStoryResponse {
    id: StoryID
  }
`;

export const query = `
  getStoryItems(id: StoryID!): [StoryItem]!

  getStories: [StoryOverview]!
`;

export const mutation = `
  setStoryItem(storyID: StoryID!, storyItemID: StoryItemID!, text: String!, userName: String!, lastStoryItemID: StoryItemID!): SetStoryItemResponse

  setStory(storyID: StoryID!, title: String!): SetStoryResponse
`;
