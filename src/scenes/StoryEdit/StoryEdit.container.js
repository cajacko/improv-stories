// @flow

import { connect } from '@cajacko/lib/lib/react-redux';
import { compose } from 'redux';
import withRouter from '@cajacko/lib/components/HOCs/withRouter';
import StoryEdit from './StoryEdit.component';
import { setStory } from '../../store/stories/actions';

/**
 * Get the checklist title from the store
 */
const mapStateToProps = (
  { stories },
  {
    match: {
      params: { storyID },
    },
  }
) => {
  const isNew = storyID === 'new';

  return {
    isNew,
    title: isNew ? null : stories.getIn(['storiesByID', storyID, 'title']),
  };
};

/**
 * Map the redux actions to props
 */
const mapDispatchToProps = (
  dispatch,
  {
    match: {
      params: { storyID },
    },
  }
) => ({
  save: name => dispatch(setStory(name, storyID === 'new' ? null : storyID)),
});

export default compose(
  withRouter,
  connect(
    mapStateToProps,
    mapDispatchToProps
  )
)(StoryEdit);
