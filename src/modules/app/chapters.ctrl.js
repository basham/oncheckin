'use strict';

module.exports = function($scope, $firebase, firebaseRef) {

  // Grab the list of chapters.
  var chaptersRef = firebaseRef('chapters');

  // Initialize scope objects.
  $scope.chapters = $firebase(chaptersRef);

};
