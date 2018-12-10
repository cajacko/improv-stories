// @flow

import createReducer from '@cajacko/lib/utils/createReducer';
import { Map, List } from 'immutable';

const initialState = Map({
  storiesByID: Map({
    'only-story': Map({
      id: 'only-story',
      storyItems: List(['-1', '-2', '-3', '-4', '-5', '-6']),
    }),
  }),
  storyItemsByID: Map({
    '-1': Map({
      id: '1',
      userID: 'user-1',
      text:
        'Once upon a time there was a little goose called Charlie. Today Charlie wanted to give his friend a little smile',
    }),
    '-2': Map({
      id: '1',
      userID: 'user-2',
      text: ', but there was one problem. Charlie could not',
    }),
    '-3': Map({
      id: '1',
      userID: 'user-1',
      text: 'smile. So he went to the best smile doctor around. Mr',
    }),
    '-4': Map({
      id: '1',
      userID: 'user-2',
      text: 'P.M. Squiggle. Mr P.M. Squiggle was a rough',
    }),
    '-5': Map({
      id: '1',
      userID: 'user-1',
      text:
        'looking dude, who always had a manic smile on his face. Charlie stepped into his smile-emporium and enquired',
    }),
    '-6': Map({
      id: '1',
      userID: 'user-2',
      text: 'as to when he may get an appointment',
    }),
  }),
});

export default createReducer(initialState, {});
