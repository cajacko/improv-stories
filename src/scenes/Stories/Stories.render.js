// @flow

import React from 'react';
import styled from 'styled-components';
import HeaderWithContent from '@cajacko/lib/components/Layout/HeaderWithContent';
import { Div } from '@cajacko/lib/components/UI';
import withRouter from '@cajacko/lib/components/HOCs/withRouter';
import Button from '@cajacko/lib/components/Button';
import { PROFILE, PLUS } from '@cajacko/lib/config/icons';
import buttons from '@cajacko/lib/config/styles/buttons';
import StoriesList from '../../components/Stories/List';

const buttonSpacing = 20;
const buttonType = buttons.CONTAINED_CIRCLE_ICON.DEFAULT;
const bottomListMargin = buttonType.height + buttonSpacing * 2;

const ButtonContainer = styled(Div)`
  position: absolute;
  bottom: ${buttonSpacing};
  right: ${buttonSpacing};
`;

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
    <StoriesList bottomPadding={bottomListMargin} />
    <ButtonContainer>
      <Button
        action={() => push('/story/new/edit')}
        icon={PLUS}
        type={buttonType}
      />
    </ButtonContainer>
  </HeaderWithContent>
);

export default withRouter(Stories);
