// @flow

import React from 'react';
import styled from 'styled-components';
import Text from '@cajacko/lib/components/Text';
import { Div } from '@cajacko/lib/components/UI';
import { GREY_LIGHT } from '@cajacko/lib/config/styles/colors';
import { BACKGROUND_COLORS } from '@cajacko/lib/config/styles/textIconColors';

const Container = styled(Div)`
  padding-vertical: 5;
  align-items: center;
  background-color: ${({ backgroundColor }) => backgroundColor};
  border-top-width: 1;
  border-top-color: ${GREY_LIGHT};
`;

/**
 * The story timer component
 */
const Timer = ({ time }) => {
  const backgroundColor =
    time > 3 ? BACKGROUND_COLORS.PRIMARY : BACKGROUND_COLORS.ERROR;

  return (
    <Container backgroundColor={backgroundColor}>
      <Text
        type="h6"
        text={{ _textFromConst: String(time) }}
        backgroundColor={backgroundColor}
      />
    </Container>
  );
};

export default Timer;
