// app.controller('baseCtrl', 
//   ($scope, $rootScope, $state, $stateParams, socket, apiService) => {

//     console.log('starting controller')

//     $scope.newGame = function() {
//       const url = '/room/new';
//       apiService.send(url)
//         .then(data => {
//           if (data.error) {
//             return alert(data.error)
//           }
          
//           alert('success!', JSON.stringify(data))
//         })
//     }

//     $scope.$on('$stateChangeStart', function(event, toState, toParams, fromState, fromParams){ 
//       console.log('in $stateChangeStart'); 
//     })
//     $scope.$on('$stateChangeSuccess', function(event, toState, toParams, fromState, fromParams){ 
//       console.log('in $stateChangeSuccess'); 
//     })
//     $scope.$on('$stateChangeError', function(event, toState, toParams, fromState, fromParams){ 
//       console.log('in $stateChangeError'); 
//     })

//     $rootScope.playerName = localStorage.name || '';
//     $rootScope.playerId = 'Connecting to server...';
//     $rootScope.testing = 'rootScope visible';

//     socket.on('connect', () => {
//       console.log('connected');
//       $rootScope.playerId = socket.getId();
//     })

//   })

// angular.module('pebble-bash').config(function (
//   $stateProvider,
//   $urlRouterProvider
// ) {

//   // Default route is base
//   $urlRouterProvider.otherwise('/');

//   $stateProvider
//     .state('base', {
//       url: '/:roomId',
//       controller: 'baseCtrl',
//       templateUrl: 'base.html'
//     });
// });
