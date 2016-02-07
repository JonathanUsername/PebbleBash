const app = angular.module('pebble-bash', ['ui.router'])

app.run((
  $rootScope,
  $state,
  $log,
  $stateParams,
  loading
) => {
  $rootScope.$on('$stateChangeError', $log.log.bind($log));
  $rootScope.$on('$stateChangeStart', () => { loading.start(); });
  $rootScope.$on('$stateChangeSuccess', () => { loading.finish(); });

  $rootScope.$state = $state;
  $rootScope.$stateParams = $stateParams;

  console.log('starting module')

})