// @flow

import createReducer from '@cajacko/lib/utils/createReducer';
import { Map } from 'immutable';
import { SET_NAME } from './actions';

const initialState = Map({
  name: 'Charlie',
});

export default createReducer(initialState, {
  [SET_NAME]: (state, { name }) => state.set('name', name),
});
