// @flow

import React from 'react';
import CardsList from '@cajacko/lib/components/Cards/List';
import ListItem from '../ListItem';

type Props = {
  stories: Array<string>,
  bottomPadding?: number,
};

const defaultProps = {
  bottomPadding: null,
};

/**
 * Render the list item
 */
const renderItem = ({ item }: { item: string }) => <ListItem storyID={item} />;

/**
 * Stories list
 */
const List = ({ stories, bottomPadding }: Props) => (
  <CardsList
    cards={stories}
    keyExtractor={id => id}
    renderItem={renderItem}
    bottomPadding={bottomPadding}
  />
);

List.defaultProps = defaultProps;

export default List;
