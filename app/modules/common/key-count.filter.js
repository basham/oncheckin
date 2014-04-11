'use strict';

module.exports = function() {
  return function(input) {
    return _.keys(input).length;
  };
};
