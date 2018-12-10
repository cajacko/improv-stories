// @flow

import React from 'react';
import CardsList from '@cajacko/lib/components/Cards/List';
import ListItem from '../ListItem';

const cards = ['1', '2', '3', '4', '5', '6', '7', '8', '9'];

const renderItem = () => <ListItem />;

/**
 * Story list
 */
const List = ({ innerRef }) => (
  <CardsList
    cards={cards}
    keyExtractor={id => id}
    renderItem={renderItem}
    innerRef={innerRef}
    inverted
  />
);

export default List;
