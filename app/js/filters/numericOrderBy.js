angular.module('seoApp').filter('numericOrderBy', ['$parse', function($parse) {

  return function(list, predicate, reverse) {
    if (!angular.isArray(list)) {
      return list;
    }
    if (!predicate) {
      return list;
    }

    var copy = [], getter = $parse(predicate);
    for (var i = 0, len = list.length; i < len; i++) {
      copy.push(list[i]);
    }

    return copy.sort(function(a, b) {
      var av = a, bv = b, ap = getter(a), bp = getter(b), result = 0;
      if (ap && bp) {
        if (ap.match(/^\d+(\.\d+)?$/) && bp.match(/^\d+(\.\d+)?$/)) {
          av = parseFloat(ap);
          bv = parseFloat(bp);
        } else {
          av = ap;
          bv = bp;
        }
      }
      if (av < bv) {
        result = -1;
      } else if (av > bv) {
        result = 1;
      }
      if (reverse) {
        result = -1 * result;
      }
      return result;
    });
  };
}]);