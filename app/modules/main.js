'use strict';

angular.module('oncheckinApp', [
  'ngCookies',
  'ngResource',
  'ngSanitize',
  'ngRoute',
  'ui.router',
  'angularfire.firebase',
  'angularfire.login',
  'firebase',
  'angular-underscore',
  'ui.bootstrap',
  'ui.bootstrap.tpls',
  'angularMoment'
])
  .config(function ($routeProvider, $stateProvider, $urlRouterProvider) {
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
        templateUrl: 'modules/app.html',
        controller: 'AppCtrl'
      })
      .state('app.chapters', {
        url: '/',
        templateUrl: 'modules/app/chapters.html',
        controller: 'AppChaptersCtrl'
      })
      .state('app.chapter', {
        abstract: true,
        url: '/chapters/:id',
        templateUrl: 'modules/app/chapter.html',
        controller: 'AppChapterCtrl'
      })
      .state('app.chapter.index', {
        url: '',
        templateUrl: 'modules/app/chapter/index.html'
      })
      .state('app.chapter.events', {
        url: '/events',
        templateUrl: 'modules/app/chapter/events.html'
      })
      .state('app.chapter.participants', {
        url: '/participants',
        templateUrl: 'modules/app/chapter/participants.html'
      })
      .state('app.event', {
        abstract: true,
        url: '/events/:id',
        templateUrl: 'modules/app/event.html',
        controller: 'AppEventCtrl'
      })
      .state('app.event.index', {
        url: '',
        templateUrl: 'modules/app/event/index.html'
      })
      .state('app.event.edit', {
        url: '',
        templateUrl: 'modules/app/event/edit.html',
        controller: 'AppEventEditCtrl'
      })
      .state('app.event.editAttendance', {
        url: '',
        templateUrl: 'modules/app/event/edit-attendance.html',
        controller: 'AppEventEditAttendanceCtrl'
      })
      .state('print', {
        abstract: true,
        templateUrl: 'modules/print.html'
      })
      .state('print.event', {
        url: '/events/:id/print',
        templateUrl: 'modules/print/event.html',
        controller: 'PrintEventCtrl'
      })
      .state('app.participant', {
        abstract: true,
        url: '/participants/:id',
        templateUrl: 'modules/app/participant.html',
        controller: 'AppParticipantCtrl'
      })
      .state('app.participant.index', {
        url: '',
        templateUrl: 'modules/app/participant/index.html'
      })
      .state('app.participant.edit', {
        url: '',
        templateUrl: 'modules/app/participant/edit.html',
        controller: 'AppParticipantEditCtrl'
      })
      .state('app.login', {
        url: '/login',
        templateUrl: 'modules/app/login.html',
        controller: 'AppLoginCtrl'
      });

    //
    // Routing
    //

    // For any unmatched url, send to a default route
    $urlRouterProvider.otherwise('/');
  })
  .run(function() {
    // Integrating FastClick to eliminate 300ms mobile touch delays.
    // http://stackoverflow.com/a/21113518
    FastClick.attach(document.body);
  });
