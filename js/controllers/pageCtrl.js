angular.module('seoApp').controller('PageCtrl', ['$scope', '$routeParams', 'SiteService', 'RatingService', 'PropertyService', 'ShowStateService', function($scope, $routeParams, SiteService, RatingService, PropertyService, ShowStateService) {
  var ratings = require('ratings'),
    slug = require('urlUtils').slug;

  $scope.id = null;
  $scope.site = null;
  $scope.page = null;
  $scope.summary = [];
  $scope.showRating = ShowStateService.showRating;
  $scope.showProperty = ShowStateService.showProperty;
  $scope.propertyNames = PropertyService.getPropertyNames();
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

  $scope.slug = slug;
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
    $scope.summary = PropertyService.getAllPropertiesForPage($scope.site, $scope.page);
    $scope.groupRatings = [];
    $scope.totalWeight = 0;
    for (var i in $scope.groups) {
      var group = $scope.groups[i], groupRatings = $scope.getRatingsByGroup(group), score = 0, weight = 0, weightedScore = 0;
      for (var j in groupRatings) {
        score += groupRatings[j].score;
        weightedScore += groupRatings[j].score * groupRatings[j].weight;
        weight += groupRatings[j].weight;
      }

      $scope.groupRatings.push({
        name: $scope.groups[i],
        ratings: groupRatings,
        score: score / groupRatings.length,
        weightedScore: weightedScore,
        weight: weight
      });
      $scope.totalWeight += weight;
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
      rateResult.weight = fn.weight;

      result.push(rateResult);
    }
    return result;
  };


}]);