// @flow

import React from 'react';
import CardsList from '@cajacko/lib/components/Cards/List';
import ListItem from '../ListItem';

type Props = {
  stories: Array<string>,
};

/**
 * Render the list item
 */
const renderItem = ({ item }: { item: string }) => <ListItem storyID={item} />;

/**
 * Stories list
 */
const List = ({ stories }: Props) => (
  <CardsList cards={stories} keyExtractor={id => id} renderItem={renderItem} />
);

export default List;
