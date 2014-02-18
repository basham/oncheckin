'use strict';

angular.module('oncheckinApp')
  .filter('keyCount', function () {
    return function(input) {
      return _.keys(input).length;
    };
  });
