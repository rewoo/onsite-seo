angular.module('seoApp').controller('RatingListCtrl', ['$scope', 'SiteService', 'RatingService', function($scope, SiteService, RatingService) {
  var urlUtils = require('urlUtils');

  $scope.allPageRatings = [];

  $scope.slug = urlUtils.slug;

  $scope.$watch(SiteService.getSite, function(newValue, oldValue, scope) {
    if (newValue && (newValue !== oldValue || !scope.allPageRatings.length)) {
      scope.allPageRatings = RatingService.getAllPageRatings(newValue, SiteService.getPages());
    }
  });
}]);