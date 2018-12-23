// @flow

import React from 'react';
import styled from 'styled-components';
import { Div } from '@cajacko/lib/components/UI';
import CardsListItem from '@cajacko/lib/components/Cards/ListItem';
import Text from '@cajacko/lib/components/Text';

export const TEXT_TYPE = 'body2';

const Container = styled(Div)`
  flex: 1;
  padding-horizontal: ${({ horizontalSpacing }) => horizontalSpacing};
  padding-top: 10;
`;

const Name = styled(Text)`
  align-self: flex-end;
`;

const Content = styled(Text)`
  margin-top: 5;
`;

/**
 * Story list item, can pass in children instead of the text content, normally
 * used for the text input
 */
const ListItem = ({ text, name, children }) => (
  <CardsListItem noBorder>
    {({ horizontalSpacing, verticalSpacing, backgroundColor }) => (
      <Container horizontalSpacing={horizontalSpacing}>
        <Name
          type="overline"
          backgroundColor={backgroundColor}
          text={name}
          greyedOut
        />
        {children || (
          <Content
            type={TEXT_TYPE}
            backgroundColor={backgroundColor}
            text={{ _textFromConst: text }}
          />
        )}
      </Container>
    )}
  </CardsListItem>
);

export default ListItem;
