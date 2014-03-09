'use strict';

angular.module('oncheckinApp')
  .controller('AppEventCtrl', function ($scope, $firebase, firebaseRef, Firebase, $stateParams, $state, $modal, $q) {
    
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
      var chapterRef = firebaseRef('chapters').child(snap.val().chapter);
      $scope.chapter = $firebase(chapterRef);

      // Find all the participants for each chapter.
      var chapterParticipantsRef = chapterRef.child('participants');
      var pRef = Firebase.util.intersection(chapterParticipantsRef, participantsRef);
      $scope.participants = $firebase(pRef);

      $scope.selectParticipant = function() {
        addAttendance($scope.selectedParticipant);
      };

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
            chapterRef.child('events').child(eventRef.name()).remove();
            eventRef.remove();
            $state.transitionTo('app.chapter', { id: chapterRef.name() });
          });
      };
    });

    function addAttendance(participant) {
      // Get attendance reference.
      var attendancesRef = firebaseRef('attendances');
      var participantRef = firebaseRef('participants').child(participant.$id);
      // Create attendance.
      var isHost = false;
      var newAttendanceRef = attendancesRef.push({
        event: eventRef.name(),
        participant: participantRef.name(),
        host: isHost
      });
      // Set priority to host. Priority can't be boolean.
      var priority = isHost ? 1 : 0;
      newAttendanceRef.setPriority(priority);
      // Add foreign references.
      eventRef.child('attendances').child(newAttendanceRef.name()).setWithPriority(true, priority);
      participantRef.child('attendances').child(newAttendanceRef.name()).setWithPriority(true, priority);
      // Clear typeahead selection.
      $scope.selectedParticipant = null;
    }

    $scope.setHost = function(attendance, value) {
      var attendanceRef = firebaseRef('attendances').child(attendance.$id);
      attendanceRef.child('host').set(value);
    };

    $scope.removeAttendance = function(attendance) {
      // Ids.
      var aId = attendance.$id;
      var pId = attendance['.id:participant'];

      // Foreign key promises.
      var promises = [];

      // Have a factory create complete handlers for different deferreds,
      // saving the promises to an array to be resolved once all complete.
      var onCompleteFactory = function() {
        var deferred = $q.defer();
        promises.push(deferred.promise);
        return function(error) {
          if(error) {
            deferred.reject(error);
            return;
          }
          deferred.resolve();
        };
      };

      // Remove foreign key references to the attendance record.
      participantsRef.child(pId).child('attendances').child(aId).remove(onCompleteFactory());
      eventRef.child('attendances').child(aId).remove(onCompleteFactory());

      // Remove the attendance record only after
      // the references have been successfully removed.
      $q.all(promises).then(function() {
        attendancesRef.child(aId).remove();
      });
    };

  });
