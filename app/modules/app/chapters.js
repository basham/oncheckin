'use strict';

angular.module('oncheckinApp')
  .controller('AppChaptersCtrl', function ($scope, $firebase, firebaseRef, Firebase, dateFilter) {
    
    // Grab the list of chapters.
    var chaptersRef = firebaseRef('chapters');
    var eventsRef = firebaseRef('events');

    // Initialize scope objects.
    $scope.chapters = $firebase(chaptersRef);
    $scope.eventsByChapter = {};
    $scope.newEvent = { date: new Date() };

    $scope.addEvent = function(chapterKey) {
      var date = dateFilter($scope.newEvent.date, 'yyyy-MM-dd');
      var chapterRef = firebaseRef('chapters/' + chapterKey);
      var newEventRef = eventsRef.push({
        name: 'Hash',
        date: date,
        chapter: chapterRef.name()
      });
      newEventRef.setPriority(date);
      chapterRef.child('events/' + newEventRef.name()).setWithPriority(true, date);
    };

    $scope.removeEvent = function(eventKey, chapterKey) {
      firebaseRef('chapters/' + chapterKey + '/events/' + eventKey).remove();
      firebaseRef('events/' + eventKey).remove();
    };

    // Iterate through each chapter once the data is available.
    chaptersRef.once('value', function(chaptersSnap) {
      chaptersSnap.forEach(function(chapterSnap) {
        // Find all the events for each chapter.
        var chapterEventsRef = chapterSnap.child('events').ref();
        var eventsRef = firebaseRef('events');
        var ref = Firebase.util.intersection(chapterEventsRef, eventsRef);
        $scope.eventsByChapter[chapterSnap.name()] = $firebase(ref);
      });
    });

  });
