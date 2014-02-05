angular.module('seoApp').factory('SearchService', ['SiteService', function(SiteService) {
  var service = {};
  var emptyResult = {pages: [], matchCount: 0 };

  var getContext = function(text, pos, before, after) {
    before = before || 4;
    after = after || 4;
    
    var i = 0, start = pos, end = pos, len = text.length;
    while (start >= 0 && i < before) {
      if (text.charAt(start--) === ' ') {
        i++;
      }
    }
    start++;
    i = 0;
    while (end < len && i < after) {
      if (text.charAt(end++) === ' ') {
        i++;
      }
    }
    end--;
    return text.substr(start, end - start);
  };
  
  var search = function(text, term) {
    var lower = text.toLowerCase(), pos, lastPos = 0, tLen = term.length, result = [];
    term = term.toLowerCase();
    pos = lower.indexOf(term);
    while (pos >= 0) {
      lastPos += pos + tLen;
      result.push(getContext(text, lastPos - tLen));
      pos = lower.substr(lastPos).indexOf(term);
    }
    return result;
  };
  
  service.getEmptyResult = function() {
    return emptyResult;
  };
  
  service.search = function(term) {
    var pages = SiteService.getPages(), result = {pages: [], matchCount: 0};
    for (var i = 0, len = pages.length; i < len; i++) {
      var page = pages[i], text = page.text.text, matches = search(text, term);
      if (matches.length) {
        result.pages.push({page: page, matches: matches});
        result.matchCount += matches.length;
      }
    }
    return result;
  };

  return service;
}]);