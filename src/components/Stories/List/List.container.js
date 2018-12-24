// @flow

import { connect } from '@cajacko/lib/lib/react-redux';
import List from './List.render';

/**
 * Grab the title from the store
 */
const mapStateToProps = ({ stories }) => ({
  stories: stories
    .get('storiesByID')
    .keySeq()
    .toJS(),
});

export default connect(mapStateToProps)(List);
