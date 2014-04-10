'use strict';

module.exports = function($scope, simpleLogin, firebaseRef) {

  $scope.logout = simpleLogin.logout;

  $scope.connectionState = {
    isConnected: true
  };

  // Dynamically update connection state.
  var connectedRef = firebaseRef('.info/connected');
  connectedRef.on('value', function(snap) {
    $scope.connectionState.isConnected = snap.val();
  });
};
