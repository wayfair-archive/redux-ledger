[![Build Status](https://travis-ci.org/wayfair/redux-ledger.svg?branch=master)](https://travis-ci.org/wayfair/redux-ledger)
[![code style: prettier](https://img.shields.io/badge/code_style-prettier-ff69b4.svg?style=flat-square)](https://github.com/prettier/prettier)
[![codecov](https://codecov.io/gh/wayfair/hypernova-php/branch/master/graph/badge.svg)](https://codecov.io/gh/wayfair/redux-ledger)

# redux-ledger

Tiny redux middleware to run integration tests with thunks!

## Install

```bash
npm install --save-dev redux-ledger
```

## Usage

Add `ledger` middleware to your Redux store. Simulate events and dispatch
just as you would before. It will intercept and record _all_ actions. Once you
are ready, use `ledger.resolve()` to wait for any pending
thunks to complete, then run your assertions.

**Note** - For accurate results place `ledger` as the first middleware in the store.

### Recording Actions

Every action in the store can be recorded by adding the middleware to the store.

```js
import makeLedger from "redux-ledger";
import { createStore, applyMiddleware } from "redux";
import thunk from "redux-thunk";

const doA = payload => ({ type: "action_a", payload });
const doB = payload => ({ type: "action_b", payload });

// For the purposes of a demo these are defined inline ...
const doAsyncA = payload => dispatch => {
  return Promise.resolve().then(() => {
    dispatch(doA(payload));
  });
};

// ... but let's pretend they are some long running requests, mocked or not
const doAsyncB = payload => dispatch => {
  return Promise.resolve().then(() => {
    dispatch(doB(payload));
  });
};

test("asynchronous actions fired from my App", () => {
  const ledger = makeLedger();
  const store = createStore(
    (state = {}) => state,
    applyMiddleware(ledger, thunk)
  );
  store.dispatch(doA({ foo: "foo" }));
  store.dispatch(doB({ bar: "bar" }));
  // ledger.getActions() to get all actions recorded
  expect(ledger.getActions()).toMatchSnapshot();
});
```

### Complex Example

`redux-ledger` shines when you want to unit test an entire component connected to
a store.

```js
import makeLedger from "redux-ledger";
import { createStore, applyMiddleware } from "redux";
import { Provider } from "react-redux";
import thunk from "redux-thunk";
import { mount } from "enzyme";
// Component to test
import MyAppContainer from "my-app-container";

test("asynchronous actions fired from my App", () => {
  const ledger = makeLedger();
  const store = createStore(reducer, applyMiddleware(ledger, thunk));
  const wrapper = mount(
    <Provider store={store}>
      <MyAppContainer />
    </Provider>
  );

  // Simulate user interaction which will kick off asynchronous actions
  wrapper.find(MyAppContainer).simulate("click");

  return ledger.resolve().then(actions => {
    expect(actions).toMatchSnapshot();
  });
});
```

## API

#### `createLedger()` - Factory

You'll want a new ledger for each new store, as ledgers should
be scoped to a single store. Returns a `ledger` middleware instance.

#### `ledger` - Instance

The middleware function. Has additional methods on the function object:

```js
// Will wait for any pending promise from actions to finish.
// Resolves with the array of actions dispatched
ledger.resolve().then(actions => { ... });

// Will return all actions recorded so far
ledger.getActions(); // [ { type: 'a', ...}, {type: 'b', ...} ]

// Will clear any previously recorded actions
ledger.clearActions();
```
