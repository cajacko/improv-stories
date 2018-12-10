// @flow

import React from 'react';
import styled from 'styled-components';
import { Div } from '@cajacko/lib/components/UI';
import CardsListItem from '@cajacko/lib/components/Cards/ListItem';
import Text from '@cajacko/lib/components/Text';

const Container = styled(Div)`
  flex: 1;
  padding-horizontal: ${({ horizontalSpacing }) => horizontalSpacing};
  padding-vertical: ${({ verticalSpacing }) => verticalSpacing};
`;

const Name = styled(Text)`
  align-self: flex-end;
`;

const Content = styled(Text)`
  margin-top: 5;
`;

/**
 * Story list item
 */
const ListItem = ({ text, name }) => (
  <CardsListItem>
    {({ horizontalSpacing, verticalSpacing, backgroundColor }) => (
      <Container
        horizontalSpacing={horizontalSpacing}
        verticalSpacing={verticalSpacing}
      >
        <Name
          type="overline"
          backgroundColor={backgroundColor}
          text={{ _textFromConst: name }}
        />
        <Content
          type="body2"
          backgroundColor={backgroundColor}
          text={{ _textFromConst: text }}
        />
      </Container>
    )}
  </CardsListItem>
);

export default ListItem;
