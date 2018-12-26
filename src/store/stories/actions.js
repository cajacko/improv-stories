// @flow

import makeActionCreator from '@cajacko/lib/utils/makeActionCreator';
import store from '@cajacko/lib/utils/store';
import uuid from '@cajacko/lib/utils/uuid';
import getAsyncActions from '@cajacko/lib/utils/getAsyncActions';
import api from '../../utils/api';

export const SAVE_STORY = getAsyncActions('SAVE_STORY');
export const SAVE_STORY_ITEM = getAsyncActions('SAVE_STORY_ITEM');
export const GET_STORY_ITEMS = getAsyncActions('GET_STORY_ITEMS');

const saveStoryItemSuccess = makeActionCreator(
  SAVE_STORY_ITEM.SUCCEEDED,
  'storyID',
  'storyItemID',
  'storyItems'
);

const saveStoryItemFailed = makeActionCreator(
  SAVE_STORY_ITEM.FAILED,
  'storyID',
  'storyItemID',
  'error',
  'storyItems'
);

export const saveStoryItem = makeActionCreator(
  SAVE_STORY_ITEM.REQUESTED,
  (storyID, text, lastStoryItemID, existingStoryItemID) => {
    const now = new Date().getTime();

    const userName = store()
      .getState()
      .profile.get('name');

    const storyItemID = existingStoryItemID || uuid();

    const storyItem = {
      storyID,
      storyItemID,
      text,
      dateLastModified: now,
      dateCreated: now,
      userName,
      lastStoryItemID,
    };

    api
      .saveStoryItem(storyItem)
      .then(({ storyItems, error }) => {
        if (error) {
          store().dispatch(saveStoryItemFailed(storyID, storyItemID, error, storyItems));
        } else {
          store().dispatch(saveStoryItemSuccess(storyID, storyItemID, storyItems));
        }
      })
      .catch(e => store().dispatch(saveStoryItemFailed(
        storyID,
        storyItemID,
        e.timeout ? 'TIMEOUT' : 'UNKNOWN_SERVER_ERROR'
      )));

    return storyItem;
  }
);

const getStoryItemsSuccess = makeActionCreator(
  GET_STORY_ITEMS.SUCCEEDED,
  'storyID',
  'storyItems'
);

const getStoryItemsFailed = makeActionCreator(
  GET_STORY_ITEMS.FAILED,
  'storyID'
);

export const getStoryItems = makeActionCreator(
  GET_STORY_ITEMS.REQUESTED,
  (storyID) => {
    api
      .getStoryItems(storyID)
      .then(storyItems =>
        store().dispatch(getStoryItemsSuccess(storyID, storyItems)))
      .catch(() => store().dispatch(getStoryItemsFailed(storyID)));

    return { storyID };
  }
);

const saveStorySuccess = makeActionCreator(SAVE_STORY.SUCCEEDED, 'storyID');

const saveStoryFailed = makeActionCreator(
  SAVE_STORY.FAILED,
  'storyID',
  'error'
);

export const setStory = makeActionCreator(
  SAVE_STORY.REQUESTED,
  (title, existingStoryID) => {
    const now = new Date().getTime();

    const storyID = existingStoryID || uuid();

    const story = {
      storyID,
      title,
      dateLastModified: now,
      dateCreated: now,
    };

    api
      .saveStory(story)
      .then(() => store().dispatch(saveStorySuccess(storyID)))
      .catch(e =>
        store().dispatch(saveStoryFailed(
          storyID,
          e.timeout ? 'TIMEOUT' : 'UNKNOWN_SERVER_ERROR'
        )));

    return story;
  }
);
