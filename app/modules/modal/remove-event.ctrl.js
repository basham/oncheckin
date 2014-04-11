'use strict';

module.exports = function($scope, $modalInstance, event) {

  $scope.event = event;

  $scope.submit = function() {
    $modalInstance.close();
  };

  $scope.cancel = function() {
    $modalInstance.dismiss('cancel');
  };

};
