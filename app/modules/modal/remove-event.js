'use strict';

angular.module('oncheckinApp')
  .controller('ModalRemoveEventCtrl', function ($scope, $modalInstance, event) {
    
    $scope.event = event;

    $scope.submit = function() {
      $modalInstance.close();
    };

    $scope.cancel = function() {
      $modalInstance.dismiss('cancel');
    };

  });
