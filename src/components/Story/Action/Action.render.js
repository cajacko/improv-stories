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

const MaxWidth = styled(Div)`
  max-width: 300;
  align-items: center;
`;

const TextContainer = styled(Div)`
  ${({ hasBottomMargin }) => (hasBottomMargin ? 'margin-bottom: 10;' : '')}
`;

/**
 * The story action component
 */
const Action = ({
  text, action, buttonText, greyedOut, error,
}) => (
  <CardsListItem>
    {({ backgroundColor }) => (
      <Container>
        <MaxWidth>
          {text && (
            <TextContainer hasBottomMargin={!!action}>
              <Text
                backgroundColor={backgroundColor}
                text={text}
                type="body2"
                center
                greyedOut={greyedOut}
                error={error}
              />
            </TextContainer>
          )}
          {action && (
            <Button
              action={action}
              type={buttons.CONTAINED.SECONDARY}
              text={buttonText}
            />
          )}
        </MaxWidth>
      </Container>
    )}
  </CardsListItem>
);

export default Action;
