// @flow

import React from 'react';
import CardsList from '@cajacko/lib/components/Cards/List';
import ListItem from '../ListItem';

const renderItem = ({ item }) => <ListItem storyItemID={item} />;

/**
 * Story list
 */
const List = ({ storyItems, innerRef }) => (
  <CardsList
    cards={storyItems}
    keyExtractor={id => id}
    renderItem={renderItem}
    innerRef={innerRef}
    inverted
  />
);

export default List;
