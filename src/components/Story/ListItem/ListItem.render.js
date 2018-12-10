// @flow

import React from 'react';
import styled from 'styled-components';
import { Div } from '@cajacko/lib/components/UI';
import CardsListItem from '@cajacko/lib/components/Cards/ListItem';
import Text from '@cajacko/lib/components/Text';

const text =
  'Once upon a time there was a little goose called Charlie. Today Charlie wanted to give his friend a little smile';

const Container = styled(Div)`
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
const ListItem = () => (
  <CardsListItem>
    {({ horizontalSpacing, verticalSpacing, backgroundColor }) => (
      <Container
        horizontalSpacing={horizontalSpacing}
        verticalSpacing={verticalSpacing}
      >
        <Name
          type="overline"
          backgroundColor={backgroundColor}
          text={{ _textFromConst: 'Charlie' }}
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
