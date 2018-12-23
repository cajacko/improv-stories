// @flow

import makeActionCreator from '@cajacko/lib/utils/makeActionCreator';

export const SET_NAME = 'SET_NAME';

export const setName = makeActionCreator(SET_NAME, 'name');
