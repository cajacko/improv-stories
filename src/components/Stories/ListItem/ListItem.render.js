// @flow

import React from 'react';
import CardsListItem from '@cajacko/lib/components/Cards/ListItem';
import Text from '@cajacko/lib/components/Cards/ListItem/Text';
import withRouter from '@cajacko/lib/components/HOCs/withRouter';

type Props = {
  title: string,
  storyID: string,
};

/**
 * Displays an individual story title for the stories list
 */
const ListItem = ({ storyID, title, history: { push } }: Props) => (
  <CardsListItem horizontalPadding action={() => push(`/story/${storyID}`)}>
    <Text text={{ _textFromConst: title }} />
  </CardsListItem>
);

export default withRouter(ListItem);
