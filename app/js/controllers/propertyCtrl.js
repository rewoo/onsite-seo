angular.module('seoApp').controller('PropertyCtrl', ['$scope', '$routeParams', 'SiteService', 'PropertyService', function($scope, $routeParams, SiteService, PropertyService) {
  var ratings = require('ratings'),
    urlUtils = require('urlUtils'),
    rating;

  $scope.pageProperties = [];
  $scope.property = PropertyService.getPropertyBySlug($routeParams.propertySlug);

  $scope.$watch(function() { return $routeParams.propertySlug; }, function(newValue, oldValue, scope) {
    if (newValue && scope.pageProperties.length === 0) {
      scope.update();
    }
  });

  $scope.$watch(SiteService.getSite, function(newValue, oldValue, scope) {
    if (newValue && newValue !== oldValue) {
      scope.update();
    }
  });

  $scope.update = function() {
    var site = SiteService.getSite(),
        pages = SiteService.getPages(),
        result = [];

    for (var i in pages) {
      var propertyResult = $scope.property.fn(pages[i], site);
      result.push({
        page: pages[i],
        property: {value: propertyResult}
      });
    }
    $scope.pageProperties = result;
  };

}]);