// @flow

// Good idea to do these first, so everything has access to the error codes
import './utils/setMarketingCopy';
import './utils/setErrors';

import { ENTRY } from './config/routes';
import reducers from './store/reducers';

export const ROUTES = ENTRY;

export const REDUCERS = reducers;

// Only enable for dev
export const LOG_STORE = false;
export const PURGE_STORE = false;
