'use strict';

angular.module('oncheckinApp')
  .controller('AppParticipantEditCtrl', function ($scope, firebaseRef, $stateParams, $state, $modal, participantService, hashNameFilter, dateFilter) {

    // Grab the event.
    var participantId = $stateParams.id;
    var participantRef = firebaseRef('participants').child(participantId);

    $scope.datepicker = {
      format: 'yyyy-MM-dd',
      options: {
        'show-weeks': false
      }
    };

    $scope.open = function($event) {
      $event.preventDefault();
      $event.stopPropagation();
      $scope.opened = true;
    };

    participantRef.once('value', function(snap) {
      var chapterId = snap.val().chapter;

      $scope.remove = function() {
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
            // Stop watching the model.
            unbindWatchModelName();
            unbindWatchModelDate();
            // Redirect to the chapter view once the participant is removed.
            participantService.remove(participantId).then(function() {
              $state.transitionTo('app.chapter', { id: chapterId });
            });
          });
      };
    });

    // Update the local copy of the participant record for editing purposes.
    participantRef.on('value', function(snap) {
      $scope.model = angular.copy(snap.val());
    });

    $scope.updateProfile = function() {
      participantService.updateProfile(participantId, $scope.model).then(function() {
        $state.transitionTo('app.participant.index', { id: participantId });
      });
    };

    $scope.updateHistory = function() {
      $scope.model.recordedLastAttendanceDate = dateFilter($scope.model.$recordedLastAttendanceDate, 'yyyy-MM-dd');
      participantService.updateHistory(participantId, $scope.model).then(function() {
        $state.transitionTo('app.participant.index', { id: participantId });
      });
    };

    var unbindWatchModelName = $scope.$watch('model.firstName', function() {
      $scope.model.suggestedAlias = hashNameFilter($scope.model);
    });

    // Manually create a Date object, since Datepicker doesn't handle timezones well.
    var unbindWatchModelDate = $scope.$watch('model.recordedLastAttendanceDate', function(val) {
      var date = null;
      if (angular.isString(val)) {
        var parts = val.split('-');
        var year = parts[0];
        var month = parts[1] - 1; // Months are base 0.
        var day = parts[2];
        date = new Date(year, month, day);
      }
      $scope.model.$recordedLastAttendanceDate = date;
    });
  });
