// @flow

import { connect } from '@cajacko/lib/lib/react-redux';
import ListItem from './ListItem.render';

/**
 * Grab the title and sorted checklist items from the store
 */
const mapStateToProps = ({ stories }, { storyID }) => ({
  title: stories.getIn(['storiesByID', storyID, 'title']),
});

export default connect(mapStateToProps)(ListItem);
