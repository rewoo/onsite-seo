angular.module('seoApp').controller('RatingCtrl', ['$scope', '$routeParams', 'SiteService', 'RatingService', function($scope, $routeParams, SiteService, RatingService) {
  var ratings = require('ratings'),
    urlUtils = require('urlUtils'),
    rating;

  $scope.pageRatings = [];
  $scope.rating = RatingService.getRatingBySlug($routeParams.ratingSlug);

  $scope.$watch(function() { return $routeParams.ratingSlug; }, function(newValue, oldValue, scope) {
    if (newValue && scope.pageRatings.length === 0) {
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
      var rateResult = $scope.rating.rateFn(pages[i], site);
      result.push({
        page: pages[i],
        rating: rateResult
      });
    }
    $scope.pageRatings = result;
  };

}]);