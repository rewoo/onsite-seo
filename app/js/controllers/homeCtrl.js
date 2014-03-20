angular.module('seoApp').controller('HomeCtrl', ['$scope', 'SiteService', 'RatingService', function($scope, SiteService, RatingService) {
  $scope.pageScores = [];
  
  $scope.$watch(SiteService.getSite, function(newValue, oldValue, scope) {
    if (newValue && ((newValue !== oldValue) || scope.pageScores.length === 0)) {
      scope.update();
    }
  });

  $scope.update = function() {
    var site = SiteService.getSite();
    $scope.pageScores = RatingService.getScoresPerPage(site, site.pages);
  };

  $scope.hover = function(event, data) {
    console.log(event, data);
  };
}]);