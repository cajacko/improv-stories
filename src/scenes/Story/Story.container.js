// @flow

import { connect } from '@cajacko/lib/lib/react-redux';
import { compose } from 'redux';
import withRouter from '@cajacko/lib/components/HOCs/withRouter';
import { createSelector } from 'reselect';
import Story from './Story.component';
import { saveStoryItem, getStoryItems } from '../../store/stories/actions';

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
const mapStateToProps = (
  { profile, stories },
  {
    match: {
      params: { storyID },
    },
  }
) => {
  const lastStoryItemID = lastStoryItemSelector(stories, storyID);
  const name = profile.get('name');

  const wasLastUser =
    !!lastStoryItemID &&
    stories.getIn(['storyItemsByID', lastStoryItemID, 'userName']) === name;

  return {
    title: stories.getIn(['storiesByID', storyID, 'title']),
    name,
    storyID,
    storyState: stories.getIn(['storiesByID', storyID, 'state']).toJS(),
    lastStoryItemID,
    wasLastUser,
  };
};

/**
 * Wrap the save story actions in redux dispatch and pass as props
 */
const mapDispatchToProps = (
  dispatch,
  {
    match: {
      params: { storyID },
    },
  }
) => ({
  saveStoryItem: (text, lastStoryItemID, storyItemID) =>
    dispatch(saveStoryItem(storyID, text, lastStoryItemID, storyItemID)),
  getStoryItems: () => dispatch(getStoryItems(storyID)),
});

export default compose(
  withRouter,
  connect(
    mapStateToProps,
    mapDispatchToProps
  )
)(Story);
