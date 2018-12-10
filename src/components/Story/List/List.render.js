// @flow

import React from 'react';
import CardsList from '@cajacko/lib/components/Cards/List';
import styled from 'styled-components';
import { Div } from '@cajacko/lib/components/UI';
import CardsListItem from '@cajacko/lib/components/Cards/ListItem';
import Button from '@cajacko/lib/components/Button';
import buttons from '@cajacko/lib/config/styles/buttons';
import ListItem from '../ListItem';

const Container = styled(Div)`
  flex: 1;
  padding-vertical: 50;
  align-items: center;
`;

const renderItem = ({ item }) => <ListItem storyItemID={item} />;

/**
 * Story list
 */
const List = ({
  storyID, storyItems, innerRef, add,
}) => (
  <CardsList
    cards={storyItems}
    keyExtractor={id => id}
    renderItem={renderItem}
    innerRef={innerRef}
    inverted
    topItem={() => (
      <CardsListItem>
        <Container>
          <Button
            action={add}
            type={buttons.CONTAINED.SECONDARY}
            text="Story.AddButton"
          />
        </Container>
      </CardsListItem>
    )}
  />
);

export default List;
