'use strict';

angular.module('oncheckinApp')
  .controller('AppChapterCtrl', function ($scope, $firebase, firebaseRef, Firebase, $modal, $stateParams, $state, eventService, participantService) {
    
    // Get the chapter record.
    var chapterId = $stateParams.id;
    var chapterRef = firebaseRef('chapters').child(chapterId);

    // Initialize scope objects.
    $scope.chapter = $firebase(chapterRef);

    // Find all the events for each chapter.
    var chapterEventsRef = chapterRef.child('events');
    var eventsRef = firebaseRef('events');
    var eRef = Firebase.util.intersection(chapterEventsRef, eventsRef);
    $scope.events = $firebase(eRef);

    // Find all the participants for each chapter.
    var chapterParticipantsRef = chapterRef.child('participants');
    var participantsRef = firebaseRef('participants');
    var pRef = Firebase.util.intersection(chapterParticipantsRef, participantsRef);
    $scope.participants = $firebase(pRef);

    $scope.openAddEventModal = function() {
      $modal
        .open({
          templateUrl: 'modules/modal/add-event.html',
          controller: 'ModalAddEventCtrl',
          resolve: {
            chapter: function() {
              return $scope.chapter;
            }
          }
        })
        .result.then(function(model) {
          var ref = eventService.add(chapterId, model);
          // Redirect to event view.
          $state.transitionTo('app.event.index', { id: ref.name() });
        });
    };

    $scope.openAddParticipantModal = function() {
      $modal
        .open({
          templateUrl: 'modules/modal/add-participant.html',
          controller: 'ModalAddParticipantCtrl',
          resolve: {
            chapter: function() {
              return $scope.chapter;
            }
          }
        })
        .result.then(function(model) {
          var ref = participantService.add(chapterId, model);
          // Redirect to event view.
          $state.transitionTo('app.participant', { id: ref.name() });
        });
    };

  });
