(function(global, factory) {
  if (typeof define === "function" && define.amd) {
    define(["module"], factory);
  } else if (typeof exports !== "undefined") {
    factory(module);
  } else {
    var mod = {
      exports: {}
    };
    factory(mod);
    global.index = mod.exports;
  }
})(this, function(module) {
  "use strict";

  module.exports = function makeLedger() {
    var promises = [];
    var actions = [];

    // Wrap thunk, call and save result
    var wrap = function wrap(action) {
      return function() {
        var result = action.apply(undefined, arguments);
        promises.push(result);

        return result;
      };
    };

    // Middleware
    var ledger = function ledger() {
      return function(next) {
        return function(action) {
          if (typeof action === "function") {
            return next(wrap(action));
          }
          actions.push(action);
          return next(action);
        };
      };
    };

    // Return actions, don't allow mutation
    ledger.getActions = function() {
      return [].concat(actions);
    };

    // Clear all actions return what we _had_
    ledger.clearActions = function() {
      return actions.splice(0);
    };

    // Recurse into pending promises returned from thunks
    ledger.resolve = function() {
      return (
        // Not immutable for sure, but it's an implementation detail so w/e
        Promise.all(promises.splice(0)).then(function() {
          // More promises were added after a thunk? Recurse
          if (promises.length) {
            return ledger.resolve();
          }

          // Return all actions back to user
          return actions;
        })
      );
    };

    return ledger;
  };
});
