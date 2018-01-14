const storyEntries = [
  {
    id: '2',
    author: 'author1',
    savedToServerDate: new Date(2018, 1, 14, 11, 0, 0),
    entryPartials: [
      {
        id: 'a',
        text:
          'Once upon a time there was a turkey called Rob.\nOne day Rob went to the toilet',
      },
    ],
  },
  {
    id: '1',
    author: 'author2',
    savedToServerDate: new Date(2018, 1, 14, 11, 30, 0),
    entryPartials: [{ id: 'b', text: '.\nIn the toilet he did a piss' }],
  },
  {
    id: '3',
    author: 'author3',
    savedToServerDate: new Date(2018, 1, 14, 13, 0, 0),
    entryPartials: [
      { id: 'c', text: ' ' },
      { id: 'd', text: ' a' },
      { id: 'e', text: ' an' },
      { id: 'f', text: ' and' },
      { id: 'g', text: ' and ' },
      { id: 'h', text: ' and p' },
      { id: 'i', text: ' and po' },
      { id: 'j', text: ' and poo' },
      { id: 'k', text: ' and pooe' },
      { id: 'l', text: ' and pooed' },
      { id: 'm', text: ' and pooed.' },
    ],
  },
  {
    id: '4',
    author: 'author1',
    savedToServerDate: new Date(2018, 1, 14, 13, 30, 0),
    entryPartials: [
      { id: 'n', text: '\n' },
      { id: 'o', text: '\nW' },
      { id: 'p', text: '\nWh' },
      { id: 'q', text: '\nWhe' },
      { id: 'r', text: '\nWhen' },
      { id: 's', text: '\nWhen ' },
      { id: 't', text: '\nWhen h' },
      { id: 'u', text: '\nWhen he' },
      { id: 'v', text: '\nWhen h' },
      { id: 'w', text: '\nWhen hi' },
      { id: 'x', text: '\nWhen his' },
    ],
  },
];

const state = {
  authors: {
    author1: 'Charlie',
    author2: 'Viki',
    author3: 'Matt',
  },

  prevEntries: [],
  nextEntries: [],

  seenUntil: new Date(2018, 1, 14, 12, 0, 0),
};

storyEntries.forEach(storyEntry => {
  const arr =
    state.seenUntil >= storyEntry.savedToServerDate
      ? 'prevEntries'
      : 'nextEntries';

  state[arr].push(storyEntry);
});

export default state;
