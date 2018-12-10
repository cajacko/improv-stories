// @flow

import { connect } from '@cajacko/lib/lib/react-redux';
import ListItem from './ListItem.render';

/**
 * Grab the title and sorted checklist items from the store
 */
const mapStateToProps = ({ stories, users }, { storyItemID }) => ({
  text: stories.getIn(['storyItemsByID', storyItemID, 'text']),
  name: users.getIn([
    stories.getIn(['storyItemsByID', storyItemID, 'userID']),
    'name',
  ]),
});

export default connect(mapStateToProps)(ListItem);
