// @flow

import React from 'react';
import HeaderWithContent from '@cajacko/lib/components/Layout/HeaderWithContent';
import withRouter from '@cajacko/lib/components/HOCs/withRouter';
import { PROFILE } from '@cajacko/lib/config/icons';

/**
 * The profile scene, let the user change their name
 */
const Stories = ({ history: { push } }) => (
  <HeaderWithContent
    header={{
      title: 'Stories.Title',
      rightButtons: [
        {
          key: 'profile',
          icon: PROFILE,
          action: () => push('/profile'),
        },
      ],
    }}
  />
);

export default withRouter(Stories);
