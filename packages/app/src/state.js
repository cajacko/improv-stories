import storyEntries from './storyEntries.json';

const state = {
  authors: {
    author1: 'Charlie',
    author2: 'Viki',
    author3: 'Matt',
  },

  prevEntries: [],
  nextEntries: [],

  seenUntil: new Date('2018-01-14T10:25:00.821Z'),
};

storyEntries
  .map(storyEntry => {
    const newStoryEntry = Object.assign({}, storyEntry);

    newStoryEntry.savedToServerDate = new Date(newStoryEntry.savedToServerDate);

    return newStoryEntry;
  })
  .forEach(storyEntry => {
    const arr =
      state.seenUntil >= storyEntry.savedToServerDate
        ? 'prevEntries'
        : 'nextEntries';

    state[arr].push(storyEntry);
  });

export default state;
