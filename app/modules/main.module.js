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
  .config(require('./main.config'))
  .run(require('./main.run'))

  //
  // Services
  //
  .factory('attendanceService', require('./common/attendance.factory'))
  .factory('eventService', require('./common/event.factory'))
  .factory('OnCompleteService', require('./common/on-complete.factory'))
  .factory('pageTitleService', require('./common/page-title.factory'))
  .factory('participantService', require('./common/participant.factory'))

  //
  // Filters
  //
  .filter('hashName', require('./common/hash-name.filter'))
  .filter('keyCount', require('./common/key-count.filter'))
  .filter('urlHostname', require('./common/url-hostname.filter'))

  //
  // Constants
  //
  .constant('config', require('./common/config.constant'));

require('../scripts/angularfire/config');
require('../scripts/services/firebase');
require('../scripts/services/login');
