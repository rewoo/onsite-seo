angular.module('seoApp').factory('RatingService', ['$http', function($http) {
  var service = {},
    ratings = require('ratings'),
    fns = ratings.getRatings(),
    urlUtils = require('urlUtils'),
    titles = [];

  for (var i in fns) {
    titles.push(fns[i].title);
  }

  service.isRatingFunction = function(name) {
    return titles.indexOf(name) >= 0;
  };

  service.getIdByTitle = function(title) {
    for (var i in fns) {
      if (fns[i].title === title) {
        return rating;
      }
    }
    return null;
  };

  service.getRatingBySlug = function(slug) {
    for (var i in fns) {
      if (urlUtils.slug(fns[i].title) === slug) {
        return fns[i];
      }
    }
    return null;
  };

  service.getAllPageRatings = function(site, pages) {
    var result = [];
    for (var i in fns) {
      var tmp = {title: fns[i].title, description: fns[i].description, score: 0, weightedScore: 0, weight: 0, pages: 0};
      for (var j in pages) {
        var rateResult = fns[i].rateFn(pages[j], site);
        tmp.pages++;
        tmp.score += rateResult.score;
        tmp.weightedScore += rateResult.weightedScore;
      }
      tmp.allScore = tmp.score / pages.length;
      result.push(tmp);
    };
    return result;
  };

  service.getAllRatingsPerPage = function(site, pages) {
    var result = [];
    for (var i in pages) {
      var tmp = {name: pages[i].name, id: pages[i].id, score: 0, weightedScore: 0, ratings: 0};
      for (var j in fns) {
        var rateResult = fns[j].rateFn(pages[i], site);
        tmp.ratings++;
        tmp.score += rateResult.score;
        tmp.weightedScore += rateResult.weightedScore;
      }
      tmp.allScore = tmp.score / fns.length;
      result.push(tmp);
    };
    return result;
  };
  return service;
}]);