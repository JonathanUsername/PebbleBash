
app.factory('apiService', function (
  $http,
  $q,
  $log,
  $rootScope,
  socket,
  loading,
  Player
) {

  return {
    send: (url, data) => {

      const deferred = $q.defer();

      loading.start();

      const params = data ? data : {};

      params.name = params.name || Player.name;
      params.playerId = params.playerId || Player.id;

      localStorage.playerName = Player.name;

      console.log(params)

      $http.post(url, params).then((resp) => {
        loading.finish();
        deferred.resolve(resp.data);
      }, (err) => {
        loading.finish();
        alert(err.data.message);
        deferred.reject();
      });

      return deferred.promise;
    }
  }

})
