// @flow

import React from 'react';
import HeaderWithContent from '@cajacko/lib/components/Layout/HeaderWithContent';
import withRouter from '@cajacko/lib/components/HOCs/withRouter';
import { PROFILE } from '@cajacko/lib/config/icons';
import StoriesList from '../../components/Stories/List';

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
  >
    <StoriesList />
  </HeaderWithContent>
);

export default withRouter(Stories);
