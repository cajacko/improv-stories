// @flow

import React, { Component } from 'react';
import withRouter from '@cajacko/lib/components/HOCs/withRouter';
import Profile from './Profile.render';

type Props = {};
type State = {};

/**
 * Business logic for the profile component
 */
class ProfileComponent extends Component<Props, State> {
  /**
   * Initialise the class, set the initial state and bind the methods
   */
  constructor(props: Props) {
    super(props);

    this.state = {
      name: props.name,
      error: null,
    };
  }

  getError = () => {
    if (!this.state.name) return 'Profile.Errors.NoName';

    const minLength = 3;
    const maxLength = 20;
    const { length } = this.state.name;

    if (length < minLength) {
      return { key: 'Profile.Errors.TooShort', length: minLength };
    }

    if (length > maxLength) {
      return { key: 'Profile.Errors.TooLong', length: maxLength };
    }

    return null;
  };

  save = () => {
    const error = this.getError();

    if (error) {
      this.setState({ error });
      return;
    }

    this.props.save(this.state.name);
    this.props.history.push('/');
  };

  onChange = (text) => {
    this.setState({ name: text, error: null });
  };

  back = () => {
    this.props.history.push('/');
  };

  /**
   * Render the component
   */
  render() {
    return (
      <Profile
        back={this.props.name && this.back}
        save={this.save}
        name={this.state.name}
        onChange={this.onChange}
        error={this.state.error}
      />
    );
  }
}

export default withRouter(ProfileComponent);
