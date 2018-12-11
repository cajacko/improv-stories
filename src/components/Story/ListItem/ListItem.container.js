// @flow

import { connect } from '@cajacko/lib/lib/react-redux';
import ListItem from './ListItem.render';

/**
 * Grab the title and sorted checklist items from the store
 */
const mapStateToProps = ({ stories }, { storyItemID }) => ({
  text: stories.getIn(['storyItemsByID', storyItemID, 'text']),
  name: {
    _textFromConst: stories.getIn(['storyItemsByID', storyItemID, 'userName']),
  },
});

export default connect(mapStateToProps)(ListItem);
