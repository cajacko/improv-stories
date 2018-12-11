// @flow

import createReducer from '@cajacko/lib/utils/createReducer';
import { Map, List, fromJS } from 'immutable';
import { SAVE_STORY_ITEM, GET_STORY_ITEMS } from './actions';

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

const initStoryItems = List(Object.keys(storyItemsByID));

const initialState = Map({
  storiesByID: Map({
    'only-story': Map({
      id: 'only-story',
      state: Map({
        type: 'INIT',
        payload: null,
      }),
      storyItems: initStoryItems,
    }),
  }),
  storyItemsByID: Map(storyItemsByID),
});

/**
 * Set the state of a specific story
 */
const setStoryState = (type, ignorePayload) => (state, payload) =>
  state.setIn(
    ['storiesByID', payload.storyID, 'state'],
    Map({
      type,
      payload: ignorePayload ? null : fromJS(payload),
    })
  );

/**
 * Set the story items given a specific story ID
 */
const setStoryItems = (state, { storyID, storyItems }) => {
  const keys = [];

  const finalState = storyItems.reduce((nextState, { id, userName, text }) => {
    keys.push(id);

    const location = ['storyItemsByID', id];

    if (nextState.hasIn(location)) return nextState;

    return nextState.setIn(
      location,
      Map({
        id,
        userName,
        text,
      })
    );
  }, state);

  return finalState.setIn(['storiesByID', storyID, 'storyItems'], List(keys));
};

/**
 * Set the state and story items in a successful response
 */
const setStateAndItems = type => (state, payload) => {
  const newState = setStoryState(type, true)(state, payload);

  return setStoryItems(newState, payload);
};

export default createReducer(initialState, {
  [SAVE_STORY_ITEM.REQUESTED]: setStoryState(SAVE_STORY_ITEM.REQUESTED),
  [SAVE_STORY_ITEM.SUCCEEDED]: setStateAndItems(SAVE_STORY_ITEM.SUCCEEDED),
  [SAVE_STORY_ITEM.FAILED]: setStoryState(SAVE_STORY_ITEM.FAILED),
  [GET_STORY_ITEMS.REQUESTED]: setStoryState(GET_STORY_ITEMS.REQUESTED),
  [GET_STORY_ITEMS.SUCCEEDED]: setStateAndItems(GET_STORY_ITEMS.SUCCEEDED),
  [GET_STORY_ITEMS.FAILED]: setStoryState(GET_STORY_ITEMS.FAILED),
});
