'use strict';

angular.module('oncheckinApp')
  .controller('ModalRemoveParticipantCtrl', function ($scope, $modalInstance, participant) {
    
    $scope.participant = participant;

    $scope.submit = function() {
      $modalInstance.close();
    };

    $scope.cancel = function() {
      $modalInstance.dismiss('cancel');
    };

  });
