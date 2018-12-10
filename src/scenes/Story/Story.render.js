// @flow

import React from 'react';
import HeaderWithContent from '@cajacko/lib/components/Layout/HeaderWithContent';
import ContentWithTabNav from '@cajacko/lib/components/Layout/ContentWithTabNav';
import {
  PROFILE,
  CHEVRON_UP,
  CHEVRON_DOWN,
  RELOAD,
} from '@cajacko/lib/config/icons';
import StoryList from '../../components/Story/List';

/**
 * The profile scene, let the user change their name
 */
const Story = ({
  toProfile, scrollToTop, scrollToBottom, reload,
}) => (
  <HeaderWithContent
    header={{
      title: 'Story.Title',
      rightButtons: [
        {
          key: 'profile',
          icon: PROFILE,
          action: toProfile,
        },
      ],
    }}
  >
    <ContentWithTabNav
      tabNav={{
        items: [
          { key: 'up', icon: CHEVRON_UP, action: scrollToTop },
          { key: 'down', icon: CHEVRON_DOWN, action: scrollToBottom },
          { key: 'refresh', icon: RELOAD, action: reload },
        ],
      }}
    >
      <StoryList />
    </ContentWithTabNav>
  </HeaderWithContent>
);

export default Story;
