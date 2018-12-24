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

    this.lastStoryItemID = null;
  }

  componentDidMount() {
    this.props.getStoryItems();
  }

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
    const { value } = this.inputRef.state;
    this.lastInputVal = value;
    this.props.saveStoryItem(value, this.lastStoryItemID);
    this.inputRef.reset();
  };

  setInputRef = (ref) => {
    this.inputRef = ref;
  };

  cancelTimer = cancel => () => {
    this.lastStoryItemID = null;
    cancel();
    this.inputRef.reset();
  };

  startTimer = startTimer => () => {
    // Store a ref to the lastStoryItemID at the time the user started writing
    // We'll submit this later
    this.lastStoryItemID = this.props.lastStoryItemID;

    return startTimer();
  };

  getError = (startTimer) => {
    const { type, payload } = this.props.storyState;

    if (type === GET_STORY_ITEMS.FAILED) {
      return {
        error: 'Story.Errors.GetItems',
        errorAction: this.props.getStoryItems,
        errorActionText: 'Story.Reload',
      };
    }

    if (type === SAVE_STORY_ITEM.FAILED) {
      const stateError = payload && payload.error;
      let error;
      let errorAction;
      let errorActionText;
      const retry = () =>
        this.props.saveStoryItem(
          this.lastInputVal,
          this.lastStoryItemID,
          payload && payload.storyItemID
        );

      switch (stateError) {
        case 'STORY_ITEM_ALREADY_ADDED':
          return {};
        case 'LAST_STORY_ID_MISMATCH':
          error = 'Story.Errors.Save.LastIDMismatch';
          errorAction = startTimer;
          errorActionText = 'Story.AddButton';
          break;
        case 'WAS_LAST_USER':
          error = 'Story.Errors.Save.WasLastUser';
          errorAction = startTimer;
          errorActionText = 'Story.AddButton';
          break;
        case 'TIMEOUT':
          error = 'Story.Errors.Save.Timeout';
          errorAction = retry;
          errorActionText = 'Story.Retry';
          break;
        case 'UNKNOWN_SERVER_ERROR':
        default:
          error = 'Story.Errors.Save.Retry';
          errorAction = retry;
          errorActionText = 'Story.Retry';
          break;
      }

      return {
        error,
        errorAction,
        errorActionText,
      };
    }

    return {};
  };

  back = () => {
    this.props.history.goBack();
  };

  /**
   * Render the component
   */
  render() {
    const { type } = this.props.storyState;
    const loading = type === GET_STORY_ITEMS.REQUESTED;
    const saving = type === SAVE_STORY_ITEM.REQUESTED;

    return (
      <Input.Provider innerRef={this.setInputRef}>
        <Timer.Provider onFinishTimer={this.onFinishTimer}>
          {({ isRunning, cancelTimer, startTimer }) => (
            <Story
              {...this.getError(this.startTimer(startTimer))}
              title={this.props.title}
              back={this.back}
              startTimer={this.startTimer(startTimer)}
              loading={loading}
              saving={saving}
              storyID={this.props.storyID}
              setRef={this.setRef}
              scrollToTop={this.scrollToTop}
              scrollToBottom={this.scrollToBottom}
              reload={this.props.getStoryItems}
              isAdding={isRunning}
              cancel={this.cancelTimer(cancelTimer)}
              wasLastUser={this.props.wasLastUser}
              disableRefresh={loading || saving}
            />
          )}
        </Timer.Provider>
      </Input.Provider>
    );
  }
}

export default withRouter(StoryComponent);
