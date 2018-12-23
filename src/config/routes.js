// @flow

import * as Scenes from '../scenes';

export const ENTRY = [
  {
    path: '/profile',
    component: Scenes.Profile,
  },
  {
    path: '/story/:id',
    component: Scenes.Story,
  },
  {
    component: Scenes.Stories,
  },
];
