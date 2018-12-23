// @flow

import graphqlClient from '@cajacko/lib/utils/graphqlClient';
import * as story from './story/client';

const client = {
  saveStoryItem: story.setStoryItem,
  getStoryItems: story.getStoryItems,
};

export default graphqlClient(
  client,
  'https://us-central1-improv-stories.cloudfunctions.net/graphql/graphql'
);
