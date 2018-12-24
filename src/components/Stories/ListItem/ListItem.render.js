// @flow

import React from 'react';
import CardsListItem from '@cajacko/lib/components/Cards/ListItem';
import Text from '@cajacko/lib/components/Cards/ListItem/Text';

type Props = {
  title: string,
};

/**
 * Displays an individual story title for the stories list
 */
const ListItem = ({ title }: Props) => (
  <CardsListItem horizontalPadding>
    <Text text={{ _textFromConst: title }} />
  </CardsListItem>
);

export default ListItem;
