type StoryType = "LIVE" | "STANDARD";
type Type = "GENERIC_FULL_HELP" | "NEW_STORY_PLACEHOLDER";

const settingsText = `You can adjust the story settings (such as turn time or can end turn early) by clicking the settings icon.`;

const tips = `Tip: A nice way of ending a story or chapter is to start a new line, write 2 hyphens (---) and another new line.`;

const turnDescription = `When it's your turn you will be able to continue writing the story from where it was left off. You get shown a countdown and your turn will end when the countdown reaches 0.
It will then become someone else's turn to write.`;

const share = (
  storyLink: string
) => `Share the link to this story to invite anyone to join:
${storyLink}`;

const tutorialTexts: {
  [K in StoryType]: { [K in Type]: (storyLink: string) => string };
} = {
  LIVE: {
    GENERIC_FULL_HELP: (
      storyLink
    ) => `Hello and welcome to improv stories! This is a live story!
Live stories are a way of getting online together with friends and writing a story in real time.
${turnDescription}
To be able to take a turn you must have set your name in the top right of the website and clicked "Join as Editor".
The story will become editable whenever 2 or more people have joined as editors. If you just want to watch the story, do not join as an editor.
${tips}
${settingsText}
${share(storyLink)}`,
    NEW_STORY_PLACEHOLDER: (
      storyLink
    ) => `Hello and welcome to improv stories! This is the start of a new live story!
Improv stories is a way of writing strange, fun, and curious stories with others. To get started, copy the link to this page and send it to some friends:
${storyLink}
Make sure you set your name and then press the "Join Story" button.
When a story is in progress 1 person will be editing at a time. They will have a fixed period of time e.g. 40 seconds to continue the story from where it was left.
It's also more fun to go on a group call whilst writing :)`,
  },
  STANDARD: {
    GENERIC_FULL_HELP: (
      storyLink
    ) => `Hello and welcome to improv stories! This is a standard story!
Standard stories are a way of writing improvised storied with friends but over a prolonged period of time. You can take a turn, wait a few hours or days and take another.
${turnDescription}
To be able to take a turn you must have set your name in the top right of the website and click the Take Turn button. You won't be able to take a turn if you went last or someone else is taking their turn right now.
When you've taken your turn it's a good idea to let your friends know, as they'll be able to take their turns now. We're looking to build notifications at some point to make this easier.
${tips}
${settingsText}
${share(storyLink)}`,
    NEW_STORY_PLACEHOLDER: (
      storyLink
    ) => `Hello and welcome to improv stories! This is the start of a new story!
Improv stories is a way of writing strange, fun, and curious stories with others.
Press the "Take Turn" button below to start off the story. You'll get a set amount of seconds to write the first entry to the story before being cut off.
Other people with the link can then add the next entry and so on.
Share the link to this page with anyone else you want to write the story with:
${storyLink}`,
  },
};

function getTutorialText(storyType: StoryType, storyLink: string) {
  return (type: Type) => {
    return tutorialTexts[storyType][type](storyLink);
  };
}

export default getTutorialText;
