'use strict';

module.exports = function($rootScope, pageTitleService) {
  // Integrating FastClick to eliminate 300ms mobile touch delays.
  // http://stackoverflow.com/a/21113518
  FastClick.attach(document.body);

  // Update the title whenever the state changes.
  $rootScope.$on('$stateChangeSuccess', pageTitleService.update);
};
