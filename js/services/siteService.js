angular.module('seoApp').factory('SiteService', ['$http', function($http) {
  var service = {}, urlUtils = require('urlUtils'), data = {}, init;

  init = function() {
    $http.get('seo-data.json').success(function(json) {
      data = json;
      for (var i in data.pages) {
        data.pages[i].name = urlUtils.relative(data.address, data.pages[i].url);
        data.pages[i].id = urlUtils.slug(data.pages[i].name);
      }
    });
  };
  service.getSite = function() {
    return data;
  };
  service.getPages = function() {
    return data.pages || [];
  };
  service.getPageById = function(id) {
    var pages = service.getPages();
    for (var i in pages) {
      if (pages[i].id === id) {
        return pages[i];
      }
    }
  };
  init();

  return service;
}]);