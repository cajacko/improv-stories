// @flow

import createReducer from '@cajacko/lib/utils/createReducer';
import { Map, List } from 'immutable';

const exampleStory = [
  'Llama was a cheeky little puppy, one day she decided to try and eat an entire christmas tree. When Llamas',
  'owners, Charlie and Viki, got back home, they found the biggest mess in the world',
  '. There were most displeased with how the cute little puppy had acted. So they took here to the ',
  'witch doctor. Who was well known in the area for helping to get puppies to play nice',
  '. When Chalrie and Viki took Llama to the witchdoctor, they found an old wizend man who',
  'had no face. This really surprised Charlie and Viki, who had never met anyone without a face before.',
  'They were not sure how the witch doctor was going to answer their questions about the naughty pup. Anyway Charlie',
  'decided to ask the witch doctor "Help, our puppy is so cute, but she is so naughty, is there anything you can do"',
];

const storyItemsByID = {};

exampleStory.forEach((text, i) => {
  const id = String(i);

  storyItemsByID[id] = Map({
    id,
    userName: i % 2 ? 'Charlie' : 'Viki',
    text,
  });
});

const storyItems = List(Object.keys(storyItemsByID));

const initialState = Map({
  storiesByID: Map({
    'only-story': Map({
      id: 'only-story',
      storyItems,
    }),
  }),
  storyItemsByID: Map(storyItemsByID),
});

export default createReducer(initialState, {});
