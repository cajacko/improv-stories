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
import Input from '../../components/Story/Input';
import Timer from '../../components/Story/Timer';

const TabNavOrChildren = ({ hideTabNav, ...props }) =>
  (hideTabNav ? props.children : <ContentWithTabNav {...props} />);

/**
 * The profile scene, let the user change their name
 */
const Story = ({
  toProfile,
  scrollToTop,
  scrollToBottom,
  reload,
  setRef,
  isAdding,
  cancel,
  storyID,
}) => (
  <HeaderWithContent
    header={{
      cancel: isAdding ? cancel : null,
      title: isAdding ? 'Story.Adding' : 'Story.Title',
      rightButtons: isAdding
        ? null
        : [
            {
              key: 'profile',
              icon: PROFILE,
              action: toProfile,
            },
          ],
    }}
  >
    <TabNavOrChildren
      hideTabNav={isAdding}
      tabNav={{
        items: [
          { key: 'up', icon: CHEVRON_UP, action: scrollToTop },
          { key: 'down', icon: CHEVRON_DOWN, action: scrollToBottom },
          { key: 'refresh', icon: RELOAD, action: reload },
        ],
      }}
    >
      <StoryList
        storyID={storyID}
        innerRef={setRef}
        headerComponent={isAdding ? Input : Action}
      />
      {isAdding ? <Timer /> : null}
    </TabNavOrChildren>
    {isAdding ? <KeyboardSpacer /> : null}
  </HeaderWithContent>
);

export default Story;
