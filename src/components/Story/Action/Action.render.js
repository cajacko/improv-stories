// @flow

import React, { Component } from 'react';
import styled from 'styled-components';
import { Div } from '@cajacko/lib/components/UI';
import CardsListItem from '@cajacko/lib/components/Cards/ListItem';
import Button from '@cajacko/lib/components/Button';
import buttons from '@cajacko/lib/config/styles/buttons';
import Text from '@cajacko/lib/components/Text';

const Container = styled(Div)`
  flex: 1;
  padding-vertical: 50;
  align-items: center;
`;

/**
 * The story action component
 */
const Action = ({ text, action, buttonText }) => (
  <CardsListItem>
    {({ backgroundColor }) => (
      <Container>
        {text && (
          <Text backgroundColor={backgroundColor} text={text} type="body2" />
        )}
        <Button
          action={action}
          type={buttons.CONTAINED.SECONDARY}
          text={buttonText}
        />
      </Container>
    )}
  </CardsListItem>
);

export default Action;
