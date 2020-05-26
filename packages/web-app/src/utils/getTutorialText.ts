export function getLiveStoryTutorialText(storyLink: string) {
  const raw = `Hello and welcome to improv stories! This is the start of a new live story!
Improv stories is a way of writing strange, fun, and curious stories with others. To get started, copy the link to this page and send it to some friends:
${storyLink}
Make sure you set your name and then press the "Join Story" button.
When a story is in progress 1 person will be editing at a time. They will have a fixed period of time e.g. 40 seconds to continue the story from where it was left.
It's also more fun to go on a group call whilst writing :)
`;

  return raw;
}

export function getStandardStoryTutorialText(storyLink: string) {
  const raw = `Hello and welcome to improv stories! This is the start of a new story!
Improv stories is a way of writing strange, fun, and curious stories with others.
Press the "Take Turn" button below to start off the story. You'll get a set amount of seconds to write the first entry to the story before being cut off.
Other people with the link can then add the next entry and so on.
Share the link to this page with anyone else you want to write the story with:
${storyLink}
`;

  return raw;
}
