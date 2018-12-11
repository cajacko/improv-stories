// @flow

import React, { Component } from 'react';
import withRouter from '@cajacko/lib/components/HOCs/withRouter';
import Story from './Story.render';
import * as Timer from '../../components/context/Story/Timer';
import * as Input from '../../components/context/Story/Input';
import { SAVE_STORY_ITEM, GET_STORY_ITEMS } from '../../store/stories/actions';

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

  componentDidMount() {
    this.props.getStoryItems();
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
      this.storyRef.scrollToOffset({
        animated: false,
        offset: 0,
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

  getError = (startTimer) => {
    const { type } = this.props.storyState;

    if (type === GET_STORY_ITEMS.FAILED) {
      return {
        error: 'Story.Errors.GetItems',
        errorAction: this.props.getStoryItems,
        errorActionText: 'Story.Reload',
      };
    }

    if (type === SAVE_STORY_ITEM.FAILED) {
      return {
        error: 'Story.Errors.SaveStory',
        errorAction: startTimer,
        errorActionText: 'Story.AddButton',
      };
    }

    return {};
  };

  /**
   * Render the component
   */
  render() {
    const { type } = this.props.storyState;

    return (
      <Input.Provider innerRef={this.setInputRef}>
        <Timer.Provider onFinishTimer={this.onFinishTimer}>
          {({ isRunning, cancelTimer, startTimer }) => (
            <Story
              {...this.getError(startTimer)}
              startTimer={startTimer}
              loading={type === GET_STORY_ITEMS.REQUESTED}
              saving={type === SAVE_STORY_ITEM.REQUESTED}
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
