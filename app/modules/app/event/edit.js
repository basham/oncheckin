'use strict';

module.exports = function($scope, firebaseRef, $stateParams, $state, $modal, eventService) {

  // Grab the event.
  var eventId = $stateParams.id;
  var eventRef = firebaseRef('events').child(eventId);

  eventRef.once('value', function(snap) {
    var chapterId = snap.val().chapter;

    $scope.removeEvent = function() {
      $modal
        .open({
          templateUrl: 'modules/modal/remove-event.html',
          controller: 'ModalRemoveEventCtrl',
          resolve: {
            event: function() {
              return $scope.event;
            }
          }
        })
        .result.then(function(model) {
          // Redirect to the chapter view once the event is removed.
          eventService.remove(eventId).then(function() {
            $state.transitionTo('app.chapter', { id: chapterId });
          });
        });
    };
  });

  // Update the local copy of the event record for editing purposes.
  eventRef.on('value', function(snap) {
    $scope.model = angular.copy(snap.val());
  });

  $scope.updateEvent = function() {
    eventService.update(eventId, $scope.model).then(function() {
      $state.transitionTo('app.event.index', { id: eventId });
    });
  };

};
