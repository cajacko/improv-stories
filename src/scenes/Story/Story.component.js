// @flow

import React, { Component } from 'react';
import withRouter from '@cajacko/lib/components/HOCs/withRouter';
import Story from './Story.render';
import * as Timer from '../../components/context/Story/Timer';
import * as Input from '../../components/context/Story/Input';
import { SAVE_STORY_ITEM } from '../../store/stories/actions';

type Props = {};
type State = {};

/**
 * Business logic for the story component
 */
class StoryComponent extends Component<Props, State> {
  /**
   * Initialise the class, set the initial state and bind the methods
   */
  constructor(props: Props) {
    super(props);

    if (!props.name || props.name === '') {
      this.toProfile();
    }
  }

  toProfile = () => {
    this.props.history.push('/profile');
  };

  scrollToTop = () => {
    if (this.storyRef) {
      this.storyRef.scrollToEnd({ animated: false });
    }
  };

  scrollToBottom = () => {
    if (this.storyRef) {
      this.storyRef.scrollToIndex({
        animated: false,
        index: 0,
      });
    }
  };

  setRef = (ref) => {
    this.storyRef = ref;
  };

  onFinishTimer = () => {
    this.props.saveStoryItem(this.inputRef.state.value);
    this.inputRef.reset();
  };

  setInputRef = (ref) => {
    this.inputRef = ref;
  };

  cancelTimer = cancel => () => {
    cancel();
    this.inputRef.reset();
  };

  /**
   * Render the component
   */
  render() {
    return (
      <Input.Provider innerRef={this.setInputRef}>
        <Timer.Provider onFinishTimer={this.onFinishTimer}>
          {({ isRunning, cancelTimer }) => (
            <Story
              saving={this.props.storyState.type === SAVE_STORY_ITEM.REQUESTED}
              storyID={this.props.storyID}
              setRef={this.setRef}
              toProfile={this.toProfile}
              scrollToTop={this.scrollToTop}
              scrollToBottom={this.scrollToBottom}
              reload={this.props.getStoryItems}
              isAdding={isRunning}
              cancel={this.cancelTimer(cancelTimer)}
            />
          )}
        </Timer.Provider>
      </Input.Provider>
    );
  }
}

export default withRouter(StoryComponent);
