// @flow

import React, { Component } from 'react';
import styled from 'styled-components';
import { Div } from '@cajacko/lib/components/UI';
import CardsListItem from '@cajacko/lib/components/Cards/ListItem';
import Text from '@cajacko/lib/components/Text';

const Container = styled(Div)`
  flex: 1;
  padding-vertical: 50;
  align-items: center;
`;

/**
 * The story loading component
 */
const Loading = ({ text }) => (
  <CardsListItem>
    {({ backgroundColor }) => (
      <Container>
        <Text backgroundColor={backgroundColor} text={text} />
      </Container>
    )}
  </CardsListItem>
);

export default Loading;
