function defaultGetRand() {
  return Math.random();
}

let getRand: () => number = defaultGetRand;

export function __TESTS__setGetRand(callback: typeof getRand) {
  getRand = callback;
}

export function __TESTS__reset() {
  getRand = defaultGetRand;
}

export default () => getRand();
