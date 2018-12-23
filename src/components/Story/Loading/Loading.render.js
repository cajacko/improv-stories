// @flow

import React, { Component } from 'react';
import styled from 'styled-components';
import { Div } from '@cajacko/lib/components/UI';
import CardsListItem from '@cajacko/lib/components/Cards/ListItem';
import Spinner from '@cajacko/lib/components/Spinner';

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
        <Spinner backgroundColor={backgroundColor} text={text} />
      </Container>
    )}
  </CardsListItem>
);

export default Loading;
