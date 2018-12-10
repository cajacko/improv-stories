// @flow

import createReducer from '@cajacko/lib/utils/createReducer';
import { Map } from 'immutable';

const initialState = Map({
  'user-1': Map({
    name: 'Charlie',
  }),
  'user-2': Map({
    name: 'Viki',
  }),
});

export default createReducer(initialState, {});
