const app = angular.module('pebble-bash', ['ui.router'])

app.run((
  $rootScope,
  $state,
  $window,
  $log,
  $stateParams,
  $q
) => {
  $rootScope.$on('$stateChangeError', $log.log.bind($log));

  $rootScope.$state = $state;
  $rootScope.$stateParams = $stateParams;

  console.log('starting module')

})