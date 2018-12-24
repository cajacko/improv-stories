// @flow

import * as Scenes from '../scenes';

export const ENTRY = [
  {
    path: '/profile',
    component: Scenes.Profile,
  },
  {
    path: '/story/:storyID',
    component: Scenes.Story,
  },
  {
    component: Scenes.Stories,
  },
];
