app.factory('loading', function () {
  var loading = false;
  return {
    isLoading: function () {
      return loading;
    },
    start: function () {
      loading = true;
    },
    finish: function () {
      loading = false
    }
  };
})