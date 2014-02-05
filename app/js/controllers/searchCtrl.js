angular.module('seoApp').controller('SearchCtrl', ['$scope', '$routeParams', 'SearchService', function($scope, $routeParams, SearchService) {
  $scope.term = '';
  $scope.matches = SearchService.getEmptyResult();
  
  $scope.$watch('term', function(newValue, oldValue, scope) {
    if (newValue && newValue !== oldValue && newValue.length > 2) {
      $scope.matches = SearchService.search(newValue);
    } else {
      $scope.matches = SearchService.getEmptyResult();
    }
  });

}]);