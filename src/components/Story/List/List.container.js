// @flow

import { connect } from '@cajacko/lib/lib/react-redux';
import List from './List.render';

/**
 * Grab the title and sorted checklist items from the store
 */
const mapStateToProps = ({ stories }, { storyID }) => ({
  storyItems: stories
    .getIn(['storiesByID', storyID, 'storyItems'])
    .reverse()
    .toJS(),
});

export default connect(mapStateToProps)(List);
