'use strict';

angular.module('oncheckinApp')
  .controller('AppParticipantCtrl', function ($scope, $firebase, firebaseRef, Firebase, $stateParams, $state, $modal, participantService) {
    
    // Get the participant record.
    var participantId = $stateParams.id;
    var participantRef = firebaseRef('participants').child(participantId);

    // Initialize scope objects.
    $scope.participantId = participantId;
    $scope.participant = $firebase(participantRef);

    // Join the event's attendance and participant data.
    var participantAttendancesRef = participantRef.child('attendances');
    var attendancesRef = firebaseRef('attendances');
    var eventsRef = firebaseRef('events');
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
      var chapterId = snap.val().chapter;
      var chapterRef = firebaseRef('chapters').child(chapterId);
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
            // Redirect to the chapter view once the participant is removed.
            participantService.remove(participantId).then(function() {
              $state.transitionTo('app.chapter', { id: chapterId });
            });
          });
      };
    });

  });
