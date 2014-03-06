'use strict';

angular.module('oncheckinApp')
  .controller('AppEventCtrl', function ($scope, $firebase, firebaseRef, Firebase, $stateParams, $state, $modal) {
    
    // Grab the event.
    var eventRef = firebaseRef('events/' + $stateParams.id);

    eventRef.once('value', function(snap) {
      var chapterRef = firebaseRef('chapters/' + snap.val().chapter);
      $scope.chapter = $firebase(chapterRef);

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
            chapterRef.child('events/' + eventRef.name()).remove();
            eventRef.remove();
            $state.transitionTo('app.chapter', { id: chapterRef.name() });
          });
      };
    });

    // Initialize scope objects.
    $scope.event = $firebase(eventRef);

  });
