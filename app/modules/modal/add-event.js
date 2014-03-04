'use strict';

angular.module('oncheckinApp')
  .controller('ModalAddEventCtrl', function ($scope, $modalInstance, chapter) {
    
    $scope.chapter = chapter;
    $scope.model = { name: 'Hash', date: new Date() };

    $scope.submit = function() {
      $modalInstance.close($scope.model);
    };

    $scope.cancel = function() {
      $modalInstance.dismiss('cancel');
    };

  });
