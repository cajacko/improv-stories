// @flow

import { connect } from '@cajacko/lib/lib/react-redux';
import Story from './Story.component';
import { saveStoryItem } from '../../store/stories/actions';

const storyID = 'only-story';

/**
 * Get the checklist title from the store
 */
const mapStateToProps = ({ profile }) => ({
  name: profile.get('name'),
  storyID,
});

/**
 * Wrap the save story actions in redux dispatch and pass as props
 */
const mapDispatchToProps = dispatch => ({
  saveStoryItem: text => dispatch(saveStoryItem(storyID, text)),
});

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(Story);
