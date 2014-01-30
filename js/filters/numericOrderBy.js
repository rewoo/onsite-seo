angular.module('seoApp').filter('numericOrderBy', function() {
  var getPredicate = function(o, path) {
    for (i = 0, len = path.length; i < len; i++) {
      if (!o[path[i]]) {
        return null;
      }
      o = o[path[i]];
    }
    return o;
  };
  
  return function(list, predicate, reverse) {
    var path = predicate ? predicate.split('.') : [];
    return list.sort(function(a, b) {
      var av = a, bv = b, ap = getPredicate(a, path), bp = getPredicate(b, path), result = 0;
      if (predicate && ap && bp) {
        if (ap.match(/^\d+(\.\d+)?$/) && bp.match(/^\d+(\.\d+)?$/)) {
          av = parseInt(ap);
          bv = parseInt(bp);
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
}); 