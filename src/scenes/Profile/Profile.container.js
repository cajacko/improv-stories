// @flow

import { connect } from '@cajacko/lib/lib/react-redux';
import Profile from './Profile.component';
import { setName } from '../../store/profile/actions';

/**
 * Get the checklist title from the store
 */
const mapStateToProps = ({ profile }) => ({
  name: profile.get('name'),
});

/**
 * Map the redux actions to props
 */
const mapDispatchToProps = dispatch => ({
  save: name => dispatch(setName(name)),
});

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(Profile);
