module.exports = function makeLedger() {
  const promises = [];
  const actions = [];

  // Wrap thunk, call and save result
  const wrap = action => (...args) => {
    const result = action(...args);
    promises.push(result);

    return result;
  };

  // Middleware
  const ledger = () => next => action => {
    if (typeof action === "function") {
      return next(wrap(action));
    }
    actions.push(action);
    return next(action);
  };

  // Return actions, don't allow mutation
  ledger.getActions = () => [...actions];

  // Clear all actions return what we _had_
  ledger.clearActions = () => actions.splice(0);

  // Recurse into pending promises returned from thunks
  ledger.resolve = () =>
    // Not immutable for sure, but it's an implementation detail so w/e
    Promise.all(promises.splice(0)).then(() => {
      // More promises were added after a thunk? Recurse
      if (promises.length) {
        return ledger.resolve();
      }

      // Return all actions back to user
      return actions;
    });

  return ledger;
};
