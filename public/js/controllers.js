/* 
   Set up the Angular.js controllers, the A in the MEAN stack (from mean.io).
*/
var API_ORDER_ROUTE = '/api/orders';
function OrdersCtrl($http, $scope) {
  $http.get(API_ORDER_ROUTE).success(function(data, status, headers, config) {
    if (data.error) {
      $scope.error = data.error;
    } else {
      $scope.num_orders = data.num_orders;
      $scope.total_funded = data.total_funded.toFixed(2);
      $scope.unit_symbol = data.unit_symbol;
      $scope.target = data.target;
      $scope.days_left = data.days_left ? data.days_left : 0;
      $scope.percentage_funded = Math.min($scope.total_funded / $scope.target * 100.0, 100);
    }
  }).error(function(data, status, headers, config) {
    $scope.error = "Error fetching order statistics.";
  });
}
