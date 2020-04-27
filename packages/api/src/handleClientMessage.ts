import * as firebase from "firebase/app";
import "firebase/database";
import broadCastStoriesChanged from "./broadCastStoriesChanged";
import { ClientMessage } from "./sharedTypes";
import {
  removeActiveUserFromStory,
  addActiveUserToStory,
  addStoryEntry,
  addUserToStory,
  removeStoryUser,
  setUser,
  getStoreStory,
  finishActiveStorySession,
  startNewStorySession,
  getGetDate,
  getGetId,
} from "./store";
import logger from "./logger";

var config = {
  apiKey: process.env.FIREBASE_API_KEY,
  authDomain: process.env.FIREBASE_AUTH_DOMAIN,
  databaseURL: process.env.FIREBASE_DATABASE_URL,
  storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
};

firebase.initializeApp(config);

const database = firebase.database();

const seconds = 20;

function switchOverMessage(
  userId: string,
  action: ClientMessage
  // NOTE: We want to return something other than undefined so TypeScript will ensure we cover every
  // condition
): string[] {
  switch (action.type) {
    case "ADD_ACTIVE_USER_TO_STORY":
      return broadCastStoriesChanged(
        addActiveUserToStory(userId, action.payload.storyId)
      );
    case "ADD_STORY_ENTRY":
      return broadCastStoriesChanged(
        addStoryEntry(userId, action.payload.storyId, action.payload.entry)
      );
    case "ADD_USER_TO_STORY":
      return broadCastStoriesChanged(
        addUserToStory(userId, action.payload.storyId, action.payload.isActive)
      );
    case "REMOVE_ACTIVE_USER_FROM_STORY":
      return broadCastStoriesChanged(
        removeActiveUserFromStory(userId, action.payload.storyId)
      );
    case "REMOVE_USER_FROM_STORY":
      return broadCastStoriesChanged(
        removeStoryUser(userId, action.payload.storyId)
      );
    case "SET_USER_DETAILS":
      return broadCastStoriesChanged(
        setUser(userId, action.payload.userDetails)
      );
    // NOTE: Do not add a default, then TypeScript will ensure we're handling every action
  }
}

const storyTimeouts: { [K: string]: number | undefined } = {};

function storyLoop(storyId: string) {
  const story = getStoreStory(storyId);

  if (!story) return;

  const activeUsers = Object.keys(story.activeUsers);

  const isActive = activeUsers.length >= 2;

  if (isActive) {
    if (!story.activeSession) {
      const id = getGetId()();
      const startDate = getGetDate()();
      const endDate = new Date(startDate);
      endDate.setSeconds(endDate.getSeconds() + seconds);

      const lastUserId = story.lastSession && story.lastSession.user;

      const nextUserIds = activeUsers.filter((userId) => userId !== lastUserId);

      const nextUserId =
        nextUserIds[Math.floor(Math.random() * nextUserIds.length)];

      startNewStorySession(
        {
          id,
          dateModified: startDate,
          dateStarted: startDate,
          dateWillFinish: endDate.toISOString(),
          entries: [],
          finalEntry: "",
          version: 0,
          user: nextUserId,
        },
        storyId
      );

      broadCastStoriesChanged([storyId]);

      storyTimeouts[storyId] = setTimeout(() => {
        const story = getStoreStory(storyId);

        if (
          story &&
          story.activeSession &&
          story.activeSession.entries.length
        ) {
          const ref = database.ref(`/storiesById/${storyId}/entries`);

          const entry = {
            id: story.activeSession.id,
            dateFinished: story.activeSession.dateWillFinish,
            dateStarted: story.activeSession.dateStarted,
            finalText: story.activeSession.finalEntry,
            parts: story.activeSession.entries,
            userId: story.activeSession.user,
          };

          logger.log("SAVE_STORY");

          ref.push(entry);
        }

        finishActiveStorySession(storyId);
        storyLoop(storyId);
        broadCastStoriesChanged([storyId]);
      }, seconds * 1000);
    }
  } else {
    if (storyTimeouts[storyId]) clearTimeout(storyTimeouts[storyId]);

    if (story.activeSession) {
      finishActiveStorySession(storyId);
      broadCastStoriesChanged([storyId]);
    }
  }
}

function handleClientMessage(userId: string, action: ClientMessage) {
  const changedStoryIds = switchOverMessage(userId, action);

  changedStoryIds.forEach(storyLoop);
}

export default handleClientMessage;
