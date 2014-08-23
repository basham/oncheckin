'use strict';

module.exports = function($scope, $modalInstance, chapter, hashNameFilter) {

  $scope.chapter = chapter;
  $scope.model = { firstName: '', lastName: '', alias: '' };

  $scope.submit = function() {
    $modalInstance.close($scope.model);
  };

  $scope.cancel = function() {
    $modalInstance.dismiss('cancel');
  };

  $scope.$watch('model.firstName', function() {
    $scope.model.suggestedAlias = hashNameFilter($scope.model);
  });

};
