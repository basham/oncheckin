'use strict';

module.exports = function ($routeProvider, $stateProvider, $urlRouterProvider) {
  /*
  $routeProvider
    .when('/', {
      templateUrl: 'views/main.html',
      controller: 'MainCtrl'
    })
    .when('/login', {
      authRequired: false, // if true, must log in before viewing this page
      templateUrl: 'views/login.html',
      controller: 'LoginController'
    })
    .otherwise({
      redirectTo: '/'
    });
  */

  //
  // States
  //
  $stateProvider
    .state('app', {
      abstract: true,
      templateUrl: 'app.html',
      controller: require('./app.ctrl')
    })
    .state('app.chapters', {
      url: '/',
      templateUrl: 'app/chapters.html',
      controller: require('./app/chapters.ctrl'),
      data: {
        title: 'Chapters'
      }
    })
    .state('app.chapter', {
      abstract: true,
      url: '/chapters/:id',
      templateUrl: 'app/chapter.html',
      controller: require('./app/chapter.ctrl')
    })
    .state('app.chapter.index', {
      url: '',
      templateUrl: 'app/chapter/index.html'
    })
    .state('app.chapter.events', {
      url: '/events',
      templateUrl: 'app/chapter/events.html',
      data: {
        title: 'Events'
      }
    })
    .state('app.chapter.participants', {
      url: '/participants',
      templateUrl: 'app/chapter/participants.html',
      data: {
        title: 'Participants'
      }
    })
    .state('app.event', {
      abstract: true,
      url: '/events/:id',
      templateUrl: 'app/event.html',
      controller: require('./app/event.ctrl')
    })
    .state('app.event.index', {
      url: '',
      templateUrl: 'app/event/index.html'
    })
    .state('app.event.edit', {
      url: '',
      templateUrl: 'app/event/edit.html',
      controller: require('./app/event/edit.ctrl'),
      data: {
        title: 'Edit'
      }
    })
    .state('app.event.editAttendance', {
      url: '',
      templateUrl: 'app/event/edit-attendance.html',
      controller: require('./app/event/edit-attendance.ctrl'),
      data: {
        title: 'Edit Attendance'
      }
    })
    .state('print', {
      abstract: true,
      templateUrl: 'print.html'
    })
    .state('print.event', {
      url: '/events/:id/print',
      templateUrl: 'print/event.html',
      controller: require('./print/event.ctrl')
    })
    .state('app.participant', {
      abstract: true,
      url: '/participants/:id',
      templateUrl: 'app/participant.html',
      controller: require('./app/participant.ctrl')
    })
    .state('app.participant.index', {
      url: '',
      templateUrl: 'app/participant/index.html'
    })
    .state('app.participant.edit', {
      url: '',
      templateUrl: 'app/participant/edit.html',
      controller: require('./app/participant/edit.ctrl'),
      data: {
        title: 'Edit'
      }
    })
    .state('app.login', {
      url: '/login',
      templateUrl: 'app/login.html',
      controller: require('./app/login.ctrl')
    });

  //
  // Routing
  //
  // For any unmatched url, send to a default route
  $urlRouterProvider.otherwise('/');
};
