// @flow

import makeActionCreator from '@cajacko/lib/utils/makeActionCreator';
import store from '@cajacko/lib/utils/store';
import uuid from '@cajacko/lib/utils/uuid';
import getAsyncActions from '@cajacko/lib/utils/getAsyncActions';
import api from '../../utils/api';

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
  'canRetry'
);

export const saveStoryItem = makeActionCreator(
  SAVE_STORY_ITEM.REQUESTED,
  (storyID, text) => {
    const now = new Date().getTime();

    const userName = store()
      .getState()
      .profile.get('name');

    const storyItemID = uuid();

    const storyItem = {
      storyID,
      storyItemID,
      text,
      dateLastModified: now,
      dateCreated: now,
      userName,
    };

    api
      .saveStoryItem(storyItem)
      .then(({ success, canRetry, storyItems }) => {
        if (success) {
          store().dispatch(saveStoryItemSuccess(storyID, storyItemID, storyItems));
        } else {
          store().dispatch(saveStoryItemFailed(storyID, storyItemID, canRetry));
        }
      })
      .catch(() => {
        store().dispatch(saveStoryItemFailed(storyID, storyItemID, true));
      });

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
      .then(({ storyItems }) => {
        store().dispatch(getStoryItemsSuccess(storyID, storyItems));
      })
      .catch(() => {
        store().dispatch(getStoryItemsFailed(storyID));
      });

    return { storyID };
  }
);
