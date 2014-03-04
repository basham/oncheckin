'use strict';

angular.module('oncheckinApp')
  .controller('ModalNewEventCtrl', function ($scope, $modalInstance, chapter) {
    
    $scope.chapter = chapter;
    $scope.newEvent = { name: 'Hash', date: new Date() };

    $scope.submit = function() {
      $modalInstance.close($scope.newEvent);
    };

    $scope.cancel = function() {
      $modalInstance.dismiss('cancel');
    };

  });
