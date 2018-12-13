// @flow

import { connect } from '@cajacko/lib/lib/react-redux';
import Story from './Story.component';
import { saveStoryItem, getStoryItems } from '../../store/stories/actions';
import { ONLY_STORY_ID } from '../../config/general';

const storyID = ONLY_STORY_ID;

/**
 * Get the checklist title from the store
 */
const mapStateToProps = ({ profile, stories }) => ({
  name: profile.get('name'),
  storyID,
  storyState: stories.getIn(['storiesByID', storyID, 'state']).toJS(),
});

/**
 * Wrap the save story actions in redux dispatch and pass as props
 */
const mapDispatchToProps = dispatch => ({
  saveStoryItem: text => dispatch(saveStoryItem(storyID, text)),
  getStoryItems: () => dispatch(getStoryItems(storyID)),
});

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(Story);
