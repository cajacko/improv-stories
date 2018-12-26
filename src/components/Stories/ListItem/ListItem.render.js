// @flow

import React from 'react';
import styled from 'styled-components';
import CardsListItem from '@cajacko/lib/components/Cards/ListItem';
import { Div } from '@cajacko/lib/components/UI';
import Text from '@cajacko/lib/components/Cards/ListItem/Text';
import Icon from '@cajacko/lib/components/Cards/ListItem/Icon';
import withRouter from '@cajacko/lib/components/HOCs/withRouter';
import { EDIT } from '@cajacko/lib/config/icons';

type Props = {
  title: string,
  storyID: string,
};

/**
 * Displays an individual story title for the stories list
 */
const ListItem = ({ storyID, title, history: { push } }: Props) => (
  <CardsListItem paddingLeft>
    <Text
      text={{ _textFromConst: title }}
      action={() => push(`/story/${storyID}`)}
    />
    <Icon icon={EDIT} action={() => push(`/story/${storyID}/edit`)} />
  </CardsListItem>
);

export default withRouter(ListItem);
