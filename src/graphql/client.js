// @flow

let storyItems = [
  'Llama was a cheeky little puppy, one day she decided to try and eat an entire christmas tree. When Llamas',
  'owners, Charlie and Viki, got back home, they found the biggest mess in the world',
  '. There were most displeased with how the cute little puppy had acted. So they took here to the ',
  'witch doctor. Who was well known in the area for helping to get puppies to play nice',
  '. When Chalrie and Viki took Llama to the witchdoctor, they found an old wizend man who',
  'had no face. This really surprised Charlie and Viki, who had never met anyone without a face before.',
  'They were not sure how the witch doctor was going to answer their questions about the naughty pup. Anyway Charlie',
  'decided to ask the witch doctor "Help, our puppy is so cute, but she is so naughty, is there anything you can do"',
];

storyItems = storyItems.map((text, i) => {
  const id = String(i);

  return {
    id,
    userName: i % 2 ? 'Charlie' : 'Viki',
    text,
  };
});

/**
 * Get the mock story items, until we build the DB
 */
const getMockStoryItems = (storyItem) => {
  if (storyItem) {
    storyItems.push({
      id: storyItem.storyItemID,
      userName: storyItem.userName,
      text: storyItem.text,
    });
  }

  return storyItems;
};

/**
 * Save a story item, mock functionality
 */
const saveStoryItem = storyItem =>
  new Promise((resolve, reject) => {
    setTimeout(() => {
      resolve({
        success: true,
        canRetry: null,
        storyItems: getMockStoryItems(storyItem),
      });
      // resolve({ success: false, canRetry: true });
      // resolve({ success: false, canRetry: false });
      // reject(new Error('Oh no'));
    }, 2000);
  });

/**
 * Get story items, mock functionality
 */
const getStoryItems = storyID =>
  new Promise((resolve, reject) => {
    setTimeout(() => {
      resolve({
        storyItems: getMockStoryItems(),
      });
      // reject(new Error('Oh no'));
    }, 2000);
  });

const client = {
  saveStoryItem,
  getStoryItems,
};

export default client;
