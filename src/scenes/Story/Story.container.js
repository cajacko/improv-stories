// @flow

import { connect } from '@cajacko/lib/lib/react-redux';
import Story from './Story.component';

/**
 * Get the checklist title from the store
 */
const mapStateToProps = ({ profile }) => ({
  name: profile.get('name'),
});

export default connect(mapStateToProps)(Story);
