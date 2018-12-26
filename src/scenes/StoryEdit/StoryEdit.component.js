// @flow

import React, { Component } from 'react';
import StoryEdit from './StoryEdit.render';

type Props = {};
type State = {};

/**
 * Business logic for the story edit component
 */
class StoryEditComponent extends Component<Props, State> {
  /**
   * Initialise the class, set the initial state and bind the methods
   */
  constructor(props: Props) {
    super(props);

    this.state = {
      title: props.title,
      error: null,
    };
  }

  /**
   * Get the error with the input
   */
  getError = () => {
    if (!this.state.title) return 'EditStory.Errors.NoName';

    const minLength = 3;
    const maxLength = 20;
    const { length } = this.state.title;

    if (length < minLength) {
      return { key: 'EditStory.Errors.TooShort', length: minLength };
    }

    if (length > maxLength) {
      return { key: 'EditStory.Errors.TooLong', length: maxLength };
    }

    return null;
  };

  /**
   * Save the story details
   */
  save = () => {
    const error = this.getError();

    if (error) {
      this.setState({ error });
      return;
    }

    this.props.save(this.state.title);
    // TODO: When saving, show the loading icon, when saved then navigate away
    // this.props.history.goBack();
  };

  onChange = (text) => {
    this.setState({ title: text, error: null });
  };

  /**
   * Render the component
   */
  render() {
    return (
      <StoryEdit
        isNew={this.props.isNew}
        back={this.props.history.goBack}
        save={this.save}
        title={this.state.title}
        onChange={this.onChange}
        error={this.state.error}
      />
    );
  }
}

export default StoryEditComponent;
