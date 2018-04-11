import test from "ava";
import makeLedger from "..";
import { createStore, applyMiddleware } from "redux";
import thunk from "redux-thunk";

const reducer = (state = { foo: null, bar: null }, { type, payload }) => {
  switch (type) {
    case "action_a":
      return { ...state, foo: payload.foo };
    case "action_b":
      return { ...state, bar: payload.bar };
    default:
      return state;
  }
};

const doA = payload => ({ type: "action_a", payload });
const doB = payload => ({ type: "action_b", payload });

const doAsyncA = payload => dispatch => {
  return Promise.resolve().then(() => {
    dispatch(doA(payload));
  });
};

const doAsyncB = payload => dispatch => {
  return Promise.resolve().then(() => {
    dispatch(doB(payload));
  });
};

const doAsyncC = ({ foo, bar }) => dispatch => {
  return Promise.resolve().then(() => {
    dispatch(doAsyncA({ foo }));
    dispatch(doAsyncB({ bar }));
  });
};

test("it records actions in a vanilla redux store", t => {
  const ledger = makeLedger();
  const store = createStore(reducer, applyMiddleware(thunk, ledger));
  store.dispatch(doA({ foo: "foo" }));
  store.dispatch(doB({ bar: "bar" }));
  t.snapshot(ledger.getActions());
});

test("waits for async actions", t => {
  const ledger = makeLedger();
  const store = createStore(reducer, applyMiddleware(thunk, ledger));
  store.dispatch(doAsyncA({ foo: "foo" }));
  // Here are a bunch of cascading actions
  // Something that you will run into if you're trying to simulate UI events in
  // React one after another
  return ledger
    .resolve()
    .then(() => {
      store.dispatch(doAsyncB({ bar: "bar" }));
      return ledger.resolve();
    })
    .then(() => {
      store.dispatch(doAsyncC({ foo: "fooz", bar: "baz" }));
      return ledger.resolve();
    })
    .then(actions => {
      t.snapshot(actions);
    });
});

test("getActions", t => {
  const ledger = makeLedger();
  const store = createStore(reducer, applyMiddleware(thunk, ledger));
  store.dispatch(doA({ foo: "foooooo-bar" }));
  t.snapshot(ledger.getActions());
});

test("clearActions", t => {
  const ledger = makeLedger();
  const store = createStore(reducer, applyMiddleware(thunk, ledger));
  store.dispatch(doA({ foo: "foooooo-bar" }));
  ledger.clearActions();
  t.snapshot(ledger.getActions());
});
