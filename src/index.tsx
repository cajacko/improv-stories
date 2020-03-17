import React from "react";
import ReactDOM from "react-dom";
import * as firebase from "firebase/app";
import "firebase/database";
import "./index.css";
import App from "./App";
import * as serviceWorker from "./serviceWorker";

var config = {
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY,
  authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN,
  databaseURL: process.env.REACT_APP_FIREBASE_DATABASE_URL,
  storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET
};

firebase.initializeApp(config);

// Get a reference to the database service
var database = firebase.database();

database
  .ref("/")
  .once("value")
  .then(function(snapshot) {
    console.log(snapshot.val());
  })
  .catch(console.error);

console.log(database);

ReactDOM.render(<App />, document.getElementById("root"));

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();
