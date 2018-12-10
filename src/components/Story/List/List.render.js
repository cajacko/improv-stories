// @flow

import React from 'react';
import CardsList from '@cajacko/lib/components/Cards/List';
import ListItem from '../ListItem';

const cards = ['1', '2', '3', '4'];

const renderItem = () => <ListItem />;

/**
 * Story list
 */
const List = () => (
  <CardsList
    bottomPadding
    cards={cards}
    keyExtractor={id => id}
    renderItem={renderItem}
  />
);

export default List;
