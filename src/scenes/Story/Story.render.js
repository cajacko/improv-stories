// @flow

import React from 'react';
// import styled from 'styled-components';
import HeaderWithContent from '@cajacko/lib/components/Layout/HeaderWithContent';
import ContentWithTabNav from '@cajacko/lib/components/Layout/ContentWithTabNav';
import {
  PROFILE,
  CHEVRON_UP,
  CHEVRON_DOWN,
  RELOAD,
} from '@cajacko/lib/config/icons';
// import { Div } from '@cajacko/lib/components/UI';

// const Container = styled(Div)`
//   flex: 1;
//   align-items: center;
// `;

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
      {null}
    </ContentWithTabNav>
  </HeaderWithContent>
);

export default Story;
