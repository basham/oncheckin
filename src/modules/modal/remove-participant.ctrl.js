'use strict';

module.exports = function($scope, $modalInstance, participant) {

  $scope.participant = participant;

  $scope.submit = function() {
    $modalInstance.close();
  };

  $scope.cancel = function() {
    $modalInstance.dismiss('cancel');
  };

};
