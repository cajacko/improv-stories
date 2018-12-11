// @flow

import React, { Component } from 'react';
import styled from 'styled-components';
import { Div } from '@cajacko/lib/components/UI';
import CardsListItem from '@cajacko/lib/components/Cards/ListItem';
import Button from '@cajacko/lib/components/Button';
import buttons from '@cajacko/lib/config/styles/buttons';
import { withConsumer } from '../../context/Story/Timer';

const Container = styled(Div)`
  flex: 1;
  padding-vertical: 50;
  align-items: center;
`;

/**
 * The story action component
 */
const Action = ({ startTimer }) => (
  <CardsListItem>
    <Container>
      <Button
        action={startTimer}
        type={buttons.CONTAINED.SECONDARY}
        text="Story.AddButton"
      />
    </Container>
  </CardsListItem>
);

export default withConsumer(Action);
