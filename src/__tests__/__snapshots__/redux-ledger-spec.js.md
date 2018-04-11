# Snapshot report for `src/__tests__/redux-ledger-spec.js`

The actual snapshot is saved in `redux-ledger-spec.js.snap`.

Generated by [AVA](https://ava.li).

## it records actions in a vanilla redux store

> Snapshot 1

    [
      {
        payload: {
          foo: 'foo',
        },
        type: 'action_a',
      },
      {
        payload: {
          bar: 'bar',
        },
        type: 'action_b',
      },
    

## waits for async actions

> Snapshot 1

    [
      {
        payload: {
          foo: 'foo',
        },
        type: 'action_a',
      },
      {
        payload: {
          bar: 'bar',
        },
        type: 'action_b',
      },
      {
        payload: {
          foo: 'fooz',
        },
        type: 'action_a',
      },
      {
        payload: {
          bar: 'baz',
        },
        type: 'action_b',
      },
    

## getActions

> Snapshot 1

    [
      {
        payload: {
          foo: 'foooooo-bar',
        },
        type: 'action_a',
      },
    

## clearActions

> Snapshot 1

    []