'use strict';

angular.module('oncheckinApp')
  .controller('AppEventCtrl', function ($scope, $firebase, firebaseRef, Firebase, $stateParams, $state, $modal, eventService, attendanceService) {
    
    // Grab the event.
    var eventRef = firebaseRef('events').child($stateParams.id);
    var participantsRef = firebaseRef('participants');
    var attendancesRef = firebaseRef('attendances');

    // Initialize scope objects.
    $scope.event = $firebase(eventRef);

    // Join the event's attendance and participant data.
    var eventAttendancesRef = eventRef.child('attendances');
    var participantAttendancesRef = Firebase.util.intersection(
      eventAttendancesRef,
      {
        ref: attendancesRef,
        keyMap: {
          host: 'host',
          participant: participantsRef
        }
      });
    $scope.attendances = $firebase(participantAttendancesRef);

    eventRef.once('value', function(snap) {
      var chapterId = snap.val().chapter;
      var chapterRef = firebaseRef('chapters').child(chapterId);
      $scope.chapter = $firebase(chapterRef);

      // Find all the participants for each chapter.
      var chapterParticipantsRef = chapterRef.child('participants');
      var pRef = Firebase.util.intersection(chapterParticipantsRef, participantsRef);
      $scope.participants = $firebase(pRef);

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
            eventService.remove(eventRef.name()).then(function() {
              $state.transitionTo('app.chapter', { id: chapterId });
            });
          });
      };
    });

    $scope.selectParticipant = function() {
      attendanceService.add($scope.selectedParticipant.$id, eventRef.name());
      // Clear typeahead selection.
      $scope.selectedParticipant = null;
    };

    $scope.setHost = function(attendance, value) {
      attendanceService.setHost(attendance.$id, value);
    };

    $scope.removeAttendance = function(attendance) {
      attendanceService.remove(attendance.$id);
    };

  });
