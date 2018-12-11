// @flow

import React from 'react';
import HeaderWithContent from '@cajacko/lib/components/Layout/HeaderWithContent';
import ContentWithTabNav from '@cajacko/lib/components/Layout/ContentWithTabNav';
import KeyboardSpacer from '@cajacko/lib/components/KeyboardSpacer';
import {
  PROFILE,
  CHEVRON_UP,
  CHEVRON_DOWN,
  RELOAD,
} from '@cajacko/lib/config/icons';
import StoryList from '../../components/Story/List';
import Action from '../../components/Story/Action';
import Loading from '../../components/Story/Loading';
import Input from '../../components/Story/Input';
import Timer from '../../components/Story/Timer';

const TabNavOrChildren = ({ hideTabNav, ...props }) =>
  (hideTabNav ? props.children : <ContentWithTabNav {...props} />);

/**
 * Get the header component for the story list
 */
const getHeaderComponent = ({
  saving,
  isAdding,
  loading,
  error,
  errorAction,
  errorActionText,
  startTimer,
}) => {
  if (isAdding) return Input;
  if (saving) return () => <Loading text="Story.Saving" />;
  if (loading) return () => <Loading text="Story.Loading" />;

  if (error) {
    return () => (
      <Action text={error} action={errorAction} buttonText={errorActionText} />
    );
  }

  return () => <Action action={startTimer} buttonText="Story.AddButton" />;
};

/**
 * The profile scene, let the user change their name
 */
const Story = props => (
  <HeaderWithContent
    header={{
      cancel: props.isAdding ? props.cancel : null,
      title: props.isAdding ? 'Story.Adding' : 'Story.Title',
      rightButtons: props.isAdding
        ? null
        : [
            {
              key: 'profile',
              icon: PROFILE,
              action: props.toProfile,
            },
          ],
    }}
  >
    <TabNavOrChildren
      hideTabNav={props.isAdding}
      tabNav={{
        items: [
          { key: 'up', icon: CHEVRON_UP, action: props.scrollToTop },
          { key: 'down', icon: CHEVRON_DOWN, action: props.scrollToBottom },
          { key: 'refresh', icon: RELOAD, action: props.reload },
        ],
      }}
    >
      <StoryList
        storyID={props.storyID}
        innerRef={props.setRef}
        headerComponent={getHeaderComponent(props)}
      />
      {props.isAdding ? <Timer /> : null}
    </TabNavOrChildren>
    {props.isAdding ? <KeyboardSpacer /> : null}
  </HeaderWithContent>
);

export default Story;
