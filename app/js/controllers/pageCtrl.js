angular.module('seoApp').controller('PageCtrl', ['$scope', '$routeParams', 'SiteService', 'RatingService', function($scope, $routeParams, SiteService, RatingService) {
  var ratings = require('ratings'),
    urlUtils = require('urlUtils');

  $scope.id = null;
  $scope.site = null;
  $scope.page = null;
  $scope.summary = [];
  $scope.groupRatings = [];

  $scope.$watch(SiteService.getSite, function(newValue, oldValue, scope) {
    if (newValue && newValue !== oldValue) {
      scope.update();
    }
  });

  $scope.$watch(function() {return $routeParams.pageId; }, function(newValue, oldValue, scope) {
    if (newValue && scope.id !== newValue) {
      scope.update();
    }
  });

  $scope.slug = urlUtils.slug;
  $scope.groups = ratings.getGroups();

  $scope.update = function() {
    $scope.id = $routeParams.pageId;
    $scope.site = SiteService.getSite();
    $scope.page = SiteService.getPageById($scope.id);
    if ($scope.site && $scope.page) {
      $scope.updatePage();
    }
  };

  $scope.updatePage = function() {
    $scope.summary = ratings.getPageSummary($scope.page, $scope.site);
    $scope.groupRatings = [];
    for (var i in $scope.groups) {
      var group = $scope.groups[i], groupRatings = $scope.getRatingsByGroup(group), score = 0, maxScore = 0;
      for (var j in groupRatings) {
        score += groupRatings[j].score;
        maxScore += groupRatings[j].max;
      }

      $scope.groupRatings.push({
        name: $scope.groups[i],
        ratings: groupRatings,
        score: score,
        maxScore: maxScore,
        points: ratings.getPoints(score, maxScore)
      });
    }
  };

  $scope.getRatingsByGroup = function(group) {
    var fns = ratings.getRatingsByGroup(group),
        result = [];
    for (var i in fns) {
      var fn = fns[i], rateResult;
      rateResult = fn.rateFn($scope.page, $scope.site);
      // Copy some rating properties
      rateResult.title = fn.title;
      rateResult.description = fn.description;
      rateResult.max = fn.max;

      result.push(rateResult);
    }
    return result;
  };


}]);