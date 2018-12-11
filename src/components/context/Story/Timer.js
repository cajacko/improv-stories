// @flow

import React from 'react';

const Context = React.createContext();

export const Consumer = Context.Consumer;

/**
 * Wrap the consumer and pass in the context as props
 */
export const withConsumer = CustomComponent => props => (
  <Consumer>{context => <CustomComponent {...context} {...props} />}</Consumer>
);

/**
 * The timer context, can start/stop a timer and subscribe to the seconds
 * countdown
 */
class Timer extends React.Component {
  /**
   * Set the initial class props
   */
  constructor(props) {
    super(props);

    this.state = {
      isRunning: false,
    };

    this.initialTimeout = props.timeout || 10;
    this.timeLeft = null;
    this.interval = null;

    this.subscriptions = {};
  }

  /**
   * When the component unmounts, clear the subscriptions and interval
   */
  componentWillUnmount() {
    this.subscriptions = {};
    if (this.interval) clearInterval(this.interval);
  }

  /**
   * Set the time left and broadcast this to any subscribers
   */
  setTimeLeft = (timeLeft) => {
    this.timeLeft = timeLeft;
    this.broadcast(timeLeft);
  };

  /**
   * Start a new timer. Will countdown from the specified timeout and stops
   * when gets down to 0
   */
  startTimer = () => {
    this.setTimeLeft(this.initialTimeout);
    this.setState({ isRunning: true });

    this.interval = setInterval(() => {
      const timeLeft = this.timeLeft - 1;

      if (timeLeft === 0) {
        if (this.props.onFinishTimer) this.props.onFinishTimer(this.value);
        this.cancelTimer();
        return;
      }

      this.setTimeLeft(timeLeft);
    }, 1000);
  };

  /**
   * Cancel the timer
   */
  cancelTimer = () => {
    if (this.props.onCancelTimer) this.props.onCancelTimer();
    if (this.interval) clearInterval(this.interval);

    this.setState({ isRunning: false });
    this.setTimeLeft(null);
  };

  /**
   * Run each subscription callback with the specified value
   */
  broadcast = (value) => {
    Object.values(this.subscriptions).forEach((cb) => {
      cb(value);
    });
  };

  /**
   * Add a subscription callback to the countdown, returns an unsubscribe func
   */
  subscribeToTimer = (cb) => {
    this.subscriptions[cb] = cb;

    return () => {
      delete this.subscriptions[cb];
    };
  };

  /**
   * Render the provider, can optionally pass the context done as a render prop
   */
  render() {
    const value = {
      isRunning: this.state.isRunning,
      startTimer: this.startTimer,
      cancelTimer: this.cancelTimer,
      subscribeToTimer: this.subscribeToTimer,
      initialTimeout: this.initialTimeout,
    };

    const { children } = this.props;

    return (
      <Context.Provider value={value}>
        {typeof children === 'function' ? children(value) : children}
      </Context.Provider>
    );
  }
}

export const Provider = Timer;
