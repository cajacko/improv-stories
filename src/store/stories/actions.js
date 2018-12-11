// @flow

import makeActionCreator from '@cajacko/lib/utils/makeActionCreator';
import store from '@cajacko/lib/utils/store';
import uuid from '@cajacko/lib/utils/uuid';
import getAsyncActions from '@cajacko/lib/utils/getAsyncActions';

export const SAVE_STORY_ITEM = getAsyncActions('SAVE_STORY_ITEM');

const saveStoryItemSuccess = makeActionCreator(
  SAVE_STORY_ITEM.SUCCEEDED,
  'storyID',
  'storyItemID'
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

    // Simulated api response
    setTimeout(() => {
      // success
      store().dispatch(saveStoryItemSuccess(storyID, storyItemID));

      // failed, but can still retry submitting
      // store().dispatch(saveStoryItemFailed(storyID, storyItemID, true));

      // failed, but can not retry
      // store().dispatch(saveStoryItemFailed(storyID, storyItemID, false));
    }, 1000);

    return storyItem;
  }
);
