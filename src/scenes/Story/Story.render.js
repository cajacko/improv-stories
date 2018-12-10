// @flow

import React from 'react';
// import styled from 'styled-components';
import HeaderWithContent from '@cajacko/lib/components/Layout/HeaderWithContent';
import { PROFILE } from '@cajacko/lib/config/icons';
// import { Div } from '@cajacko/lib/components/UI';

// const Container = styled(Div)`
//   flex: 1;
//   align-items: center;
// `;

/**
 * The profile scene, let the user change their name
 */
const Story = ({ toProfile }) => (
  <HeaderWithContent
    hasPadding
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
    {null}
  </HeaderWithContent>
);

export default Story;
