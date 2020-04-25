import { createStore, applyMiddleware } from "redux";
import { persistStore, persistReducer } from "redux-persist";
import storage from "redux-persist/lib/storage";
import logger from "redux-logger";
import rootReducer, { rawReducersObj } from "./reducers";

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

let store = createStore(persistedReducer, applyMiddleware(logger));

// @ts-ignore persist store doesn't accept that payload is required
const persistor = persistStore(store);

export { store, persistor };
