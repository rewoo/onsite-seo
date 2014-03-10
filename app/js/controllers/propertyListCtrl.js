angular.module('seoApp').controller('PropertyListCtrl', ['$scope', '$routeParams', 'SiteService', 'PropertyService', function($scope, $routeParams, SiteService, PropertyService) {
  var urlUtils = require('urlUtils');

  $scope.allPageProperties = [];

  $scope.slug = urlUtils.slug;

  $scope.predicate = 'title';
  $scope.reverse = false;

  $scope.$watch(SiteService.getSite, function(newValue, oldValue, scope) {
    if (newValue && (newValue !== oldValue || !scope.allPageProperties.length)) {
      scope.allPageProperties = PropertyService.getAllPageProperties(newValue, SiteService.getPages());
    }
  });
}]);
