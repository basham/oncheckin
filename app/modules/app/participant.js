'use strict';

angular.module('oncheckinApp')
  .controller('AppParticipantCtrl', function ($scope, $firebase, firebaseRef, Firebase, $stateParams, $state, $modal) {
    
    // Grab the event.
    var participantRef = firebaseRef('participants/' + $stateParams.id);

    participantRef.once('value', function(snap) {
      var chapterRef = firebaseRef('chapters/' + snap.val().chapter);
      $scope.chapter = $firebase(chapterRef);

      $scope.removeParticipant = function() {
        $modal
          .open({
            templateUrl: 'modules/modal/remove-participant.html',
            controller: 'ModalRemoveParticipantCtrl',
            resolve: {
              participant: function() {
                return $scope.participant;
              }
            }
          })
          .result.then(function(model) {
            chapterRef.child('participants/' + participantRef.name()).remove();
            participantRef.remove();
            $state.transitionTo('app.chapter', { id: chapterRef.name() });
          });
      };
    });

    // Initialize scope objects.
    $scope.participant = $firebase(participantRef);

  });
