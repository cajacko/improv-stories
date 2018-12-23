// @flow

import React, { Component } from 'react';
import Timer from './Timer.render';
import { withConsumer } from '../../context/Story/Timer';

type Props = {};
type State = {};

/**
 * Handle the state for the timer
 */
class TimerComponent extends Component<Props, State> {
  /**
   * Initialise the class, set the initial state and bind the methods
   */
  constructor(props: Props) {
    super(props);

    this.state = {
      time: props.initialTimeout,
    };

    this.unsubscribe = props.subscribeToTimer(this.setTime);
  }

  /**
   * Unsubscribe from the timer when we unmount
   */
  componentWillUnmount() {
    this.unsubscribe();
  }

  /**
   * Update the time to display
   */
  setTime = (time) => {
    this.setState({ time });
  };

  /**
   * Render the component
   */
  render() {
    return <Timer time={this.state.time} />;
  }
}

export default withConsumer(TimerComponent);
