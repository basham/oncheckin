'use strict';

angular.module('oncheckinApp')
  .controller('AppParticipantCtrl', function ($scope, $firebase, firebaseRef, Firebase, $stateParams, $state, $modal) {
    
    // Grab the event.
    var participantRef = firebaseRef('participants').child($stateParams.id);
    var attendancesRef = firebaseRef('attendances');
    var eventsRef = firebaseRef('events');

    // Initialize scope objects.
    $scope.participant = $firebase(participantRef);

    // Join the event's attendance and participant data.
    var participantAttendancesRef = participantRef.child('attendances');
    var participantAttendancesRef = Firebase.util.intersection(
      participantAttendancesRef,
      {
        ref: attendancesRef,
        keyMap: {
          host: 'host',
          event: eventsRef
        }
      });
    $scope.attendances = $firebase(participantAttendancesRef);

    participantRef.once('value', function(snap) {
      var chapterRef = firebaseRef('chapters').child(snap.val().chapter);
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
            chapterRef.child('participants').child(participantRef.name()).remove();
            participantRef.remove();
            $state.transitionTo('app.chapter', { id: chapterRef.name() });
          });
      };
    });

  });
