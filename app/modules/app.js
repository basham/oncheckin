'use strict';

angular.module('oncheckinApp')
  .controller('AppCtrl', function ($scope, simpleLogin) {
    $scope.logout = simpleLogin.logout;
  });
