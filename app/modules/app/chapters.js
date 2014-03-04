'use strict';

angular.module('oncheckinApp')
  .controller('AppChaptersCtrl', function ($scope, $firebase, firebaseRef, Firebase, dateFilter, hashNameFilter) {
    
    // Grab the list of chapters.
    var chaptersRef = firebaseRef('chapters');
    var eventsRef = firebaseRef('events');
    var participantsRef = firebaseRef('participants');

    // Initialize scope objects.
    $scope.chapters = $firebase(chaptersRef);
    $scope.eventsByChapter = {};
    $scope.participantsByChapter = {};
    $scope.newEvent = { name: 'Hash', date: new Date() };
    $scope.newParticipant = { firstName: '', lastName: '', alias: '' };

    $scope.participants = $firebase(participantsRef);
    $scope.selectedParticipant = null;

    $scope.addEvent = function(chapterKey) {
      // Grab ref to the chapter.
      var chapterRef = firebaseRef('chapters/' + chapterKey);
      // Flatten the date object into a string.
      var date = dateFilter($scope.newEvent.date, 'yyyy-MM-dd');
      // Create the new event.
      var newEventRef = eventsRef.push({
        name: $scope.newEvent.name,
        date: date,
        chapter: chapterRef.name()
      });
      // Set the priority.
      var priority = date;
      newEventRef.setPriority(priority);
      // Link the event to the chapter.
      chapterRef.child('events/' + newEventRef.name()).setWithPriority(true, priority);
    };

    $scope.removeEvent = function(eventKey, chapterKey) {
      firebaseRef('chapters/' + chapterKey + '/events/' + eventKey).remove();
      firebaseRef('events/' + eventKey).remove();
    };

    $scope.addParticipant = function(chapterKey) {
      // Grab ref to the chapter.
      var chapterRef = firebaseRef('chapters/' + chapterKey);
      // Create the new participant.
      var newParticipantRef = participantsRef.push({
        firstName: $scope.newParticipant.firstName,
        lastName: $scope.newParticipant.lastName,
        alias: $scope.newParticipant.alias,
        chapter: chapterRef.name()
      });
      // Set the priority.
      var priority = [$scope.newParticipant.lastName, $scope.newParticipant.firstName].join(', ');
      newParticipantRef.setPriority(priority);
      // Link the participant to the chapter.
      chapterRef.child('participants/' + newParticipantRef.name()).setWithPriority(true, priority);
    };

    $scope.removeParticipant = function(participantKey, chapterKey) {
      firebaseRef('chapters/' + chapterKey + '/participants/' + participantKey).remove();
      firebaseRef('participants/' + participantKey).remove();
    };

    $scope.$watch('newParticipant.firstName', function() {
      $scope.newParticipant.suggestedAlias = hashNameFilter($scope.newParticipant);
    });

    // Iterate through each chapter once the data is available.
    chaptersRef.once('value', function(chaptersSnap) {
      chaptersSnap.forEach(function(chapterSnap) {

        // Find all the events for each chapter.
        var chapterEventsRef = chapterSnap.child('events').ref();
        var eventsRef = firebaseRef('events');
        var eRef = Firebase.util.intersection(chapterEventsRef, eventsRef);
        $scope.eventsByChapter[chapterSnap.name()] = $firebase(eRef);

        // Find all the participants for each chapter.
        var chapterParticipantsRef = chapterSnap.child('participants').ref();
        var participantsRef = firebaseRef('participants');
        var pRef = Firebase.util.intersection(chapterParticipantsRef, participantsRef);
        $scope.participantsByChapter[chapterSnap.name()] = $firebase(pRef);
      });
    });

    $scope.selectParticipant = function() {
      console.log('woo', $scope.selectedParticipant);
    };

  });
