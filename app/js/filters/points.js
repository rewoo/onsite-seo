angular.module('seoApp').filter('points', function() {
  return function(score) {
    score = Math.min(Math.max(0, score), 1);
    return Math.max(1, Math.ceil(score * 5));
  };
}); 