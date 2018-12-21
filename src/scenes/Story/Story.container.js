// @flow

import { connect } from '@cajacko/lib/lib/react-redux';
import { createSelector } from 'reselect';
import Story from './Story.component';
import { saveStoryItem, getStoryItems } from '../../store/stories/actions';
import { ONLY_STORY_ID } from '../../config/general';

const storyID = ONLY_STORY_ID;

const lastStoryItemSelector = createSelector(
  (stories, id) => stories.getIn(['storiesByID', id, 'storyItems']),
  (storyItems) => {
    const storyItemsArr = storyItems.toJS();

    if (!storyItemsArr || !storyItemsArr.length) return null;

    const lastItemID = storyItemsArr[storyItemsArr.length - 1];

    if (!lastItemID) return null;

    return lastItemID;
  }
);

/**
 * Get the checklist title from the store
 */
const mapStateToProps = ({ profile, stories }) => ({
  name: profile.get('name'),
  storyID,
  storyState: stories.getIn(['storiesByID', storyID, 'state']).toJS(),
  lastStoryItemID: lastStoryItemSelector(stories, storyID),
});

/**
 * Wrap the save story actions in redux dispatch and pass as props
 */
const mapDispatchToProps = dispatch => ({
  saveStoryItem: (text, lastStoryItemID, storyItemID) =>
    dispatch(saveStoryItem(storyID, text, lastStoryItemID, storyItemID)),
  getStoryItems: () => dispatch(getStoryItems(storyID)),
});

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(Story);
