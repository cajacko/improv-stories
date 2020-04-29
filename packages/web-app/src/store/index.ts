import { StateType } from "typesafe-actions";
import { createStore, applyMiddleware, compose } from "redux";
import { persistStore, persistReducer, REHYDRATE } from "redux-persist";
import storage from "redux-persist/lib/storage";
import rootReducer, { rawReducersObj } from "./reducers";
import { init } from "../utils/socket";

declare global {
  interface Window {
    __REDUX_DEVTOOLS_EXTENSION_COMPOSE__?: typeof compose;
  }
}

type ReducerKey = keyof typeof rawReducersObj;

const blacklist: ReducerKey[] | undefined = undefined;
const whitelist: ReducerKey[] | undefined = ["currentUser"];

const persistConfig = {
  key: "root",
  storage,
  blacklist,
  whitelist,
};

const persistedReducer = persistReducer(persistConfig, rootReducer);

const composeEnhancers =
  typeof window === "object" && window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__
    ? window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__
    : compose;

const enhancer = composeEnhancers(
  applyMiddleware<unknown, StateType<typeof rootReducer>>(
    (newStore) => (next) => (action) => {
      next(action);

      // Initialise the socket connection on rehydration as we now have the user id
      if (action.type === REHYDRATE) {
        init(newStore.getState().currentUser.id);
      }
    }
  )
  // other store enhancers if any
);

let store = createStore(persistedReducer, enhancer);

// @ts-ignore persist store doesn't accept that payload is required
const persistor = persistStore(store);

export { store, persistor };
