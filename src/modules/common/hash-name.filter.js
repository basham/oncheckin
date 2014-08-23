'use strict';

module.exports = function() {
  return function(input) {
    var alias = input.alias;
    var firstName = input.firstName;
    // Ignore input that isn't a string.
    if (!angular.isString(alias)) {
      return alias;
    }
    return alias.length ? alias : 'Just ' + firstName;
  };
};
