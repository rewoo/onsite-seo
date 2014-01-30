angular.module('seoApp').factory('RatingService', [function() {
  var service = {},
    ratings = require('ratings'),
    fns = ratings.getRatings(),
    slug = require('urlUtils').slug,
    titles = [];

  for (var i in fns) {
    titles.push(fns[i].title);
  }

  service.isRatingFunction = function(name) {
    return titles.indexOf(name) >= 0;
  };

  service.getRatingBySlug = function(text) {
    for (var i in fns) {
      if (slug(fns[i].title) === text) {
        return fns[i];
      }
    }
    return null;
  };

  service.getAllPageRatings = function(site, pages) {
    var result = [];
    for (var i in fns) {
      var tmp = {title: fns[i].title, description: fns[i].description, score: 0, weightedScore: 0, weight: fns[i].weight, pages: 0};
      for (var j in pages) {
        var rateResult = fns[i].rateFn(pages[j], site);
        tmp.pages++;
        tmp.score += rateResult.score;
        tmp.weightedScore += tmp.score * tmp.weight;
      }
      tmp.score = tmp.score / pages.length;
      result.push(tmp);
    };
    return result;
  };

  service.getAllRatingsPerPage = function(site, pages) {
    var result = [];
    for (var i in pages) {
      var tmp = {name: pages[i].name, id: pages[i].id, score: 0, weightedScore: 0, weight: 0, ratings: 0};
      for (var j in fns) {
        var rateResult = fns[j].rateFn(pages[i], site);
        tmp.ratings++;
        tmp.score += rateResult.score;
        tmp.weightedScore += rateResult.score * fns[j].weight;
        tmp.weight += fns[j].weight;
      }
      tmp.score = tmp.score / fns.length;
      tmp.weightedScore = tmp.weightedScore / tmp.weight;
      result.push(tmp);
    };
    return result;
  };
  return service;
}]);