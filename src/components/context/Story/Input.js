// @flow

import React from 'react';

const Context = React.createContext();

export const Consumer = Context.Consumer;

/**
 * Wrap the consumer so we can pass in the context as props
 */
export const withConsumer = CustomComponent => props => (
  <Consumer>{context => <CustomComponent {...context} {...props} />}</Consumer>
);

/**
 * Input context. Used for any part of the react tree that needs to know the
 * input value, but doesn't need to rerender for it.
 */
class Input extends React.Component {
  /**
   * Set the initial state and let the parent grab the ref if it wants it
   */
  constructor(props) {
    super(props);

    this.state = {
      value: null,
    };

    if (props.innerRef) props.innerRef(this);
  }

  /**
   * Set the value of the input
   */
  setValue = (value) => {
    this.setState({ value });

    if (this.props.onSetValue) this.props.onSetValue(value);
  };

  /**
   * Render the provider
   */
  render() {
    return (
      <Context.Provider
        value={{
          value: this.state.value,
          setValue: this.setValue,
        }}
      >
        {this.props.children}
      </Context.Provider>
    );
  }
}

export const Provider = Input;

export default Context;
