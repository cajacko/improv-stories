// @flow

import * as Scenes from '../scenes';

export const ENTRY = [
  {
    exact: true,
    path: '/profile',
    component: Scenes.Profile,
  },
  {
    exact: true,
    path: '/story/:storyID/edit',
    component: Scenes.StoryEdit,
  },
  {
    exact: true,
    path: '/story/:storyID',
    component: Scenes.Story,
  },
  {
    component: Scenes.Stories,
  },
];
