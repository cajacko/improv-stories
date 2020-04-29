import * as firebase from "firebase/app";
import "firebase/database";

let database: firebase.database.Database;

function defaultGetDatabase() {
  if (database) return database;

  var config = {
    apiKey: process.env.FIREBASE_API_KEY,
    authDomain: process.env.FIREBASE_AUTH_DOMAIN,
    databaseURL: process.env.FIREBASE_DATABASE_URL,
    storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
  };

  firebase.initializeApp(config);

  database = firebase.database();

  return database;
}

let getDatabase: () => firebase.database.Database = defaultGetDatabase;

export function __TESTS__setGetDatabase(callback: any) {
  getDatabase = callback;
}

export function __TESTS__reset() {
  getDatabase = defaultGetDatabase;
  // @ts-ignore
  database = undefined;
}

export default () => getDatabase();
