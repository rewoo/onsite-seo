angular.module('seoApp').controller('RatingListCtrl', ['$scope', 'SiteService', 'RatingService', function($scope, SiteService, RatingService) {
  var urlUtils = require('urlUtils');

  $scope.allPageRatings = [];

  $scope.slug = urlUtils.slug;
  $scope.totalWeight = 0;

  $scope.predicate = 'title';
  $scope.reverse = false;

  $scope.$watch(SiteService.getSite, function(newValue, oldValue, scope) {
    if (newValue && (newValue !== oldValue || !scope.allPageRatings.length)) {
      scope.allPageRatings = RatingService.getAllPageRatings(newValue, SiteService.getPages());
      scope.totalWeight = 0;
      for (var i = scope.allPageRatings.length - 1; i >= 0; i--) {
        scope.totalWeight += scope.allPageRatings[i].weight;
      }
    }
  });
}]);