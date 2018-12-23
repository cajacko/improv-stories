// @flow

import React from 'react';
import CardsList from '@cajacko/lib/components/Cards/List';
import ListItem from '../ListItem';

const renderItem = ({ item }) => <ListItem storyItemID={item} />;

/**
 * Story list
 */
const List = ({
  storyID, storyItems, innerRef, headerComponent,
}) => (
  <CardsList
    cards={storyItems}
    keyExtractor={id => id}
    renderItem={renderItem}
    innerRef={innerRef}
    inverted
    ListHeaderComponent={headerComponent}
  />
);

export default List;
