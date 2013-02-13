'use strict';

EstimationGameApp.controller('MainCtrl', function($scope, items) {
  $scope.items = items.list();
});
