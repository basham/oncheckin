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
        url: '/chapters/:id',
        templateUrl: 'modules/app/chapter.html',
        controller: 'AppChapterCtrl'
      })
      .state('app.event', {
        url: '/events/:id',
        templateUrl: 'modules/app/event.html',
        controller: 'AppEventCtrl'
      })
      .state('app.participant', {
        url: '/participants/:id',
        templateUrl: 'modules/app/participant.html',
        controller: 'AppParticipantCtrl'
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
  });
