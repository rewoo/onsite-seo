angular.module('seoApp').controller('PageListCtrl', ['$scope', 'SiteService', 'RatingService', function($scope, SiteService, RatingService) {
  $scope.ratingsPerPage = [];

  $scope.$watch(SiteService.getSite, function(newValue, oldValue, scope) {
    if (newValue && (newValue !== oldValue || !scope.ratingsPerPage.length)) {
      scope.ratingsPerPage = RatingService.getAllRatingsPerPage(newValue, SiteService.getPages());
    }
  });
}]);