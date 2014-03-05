angular.module('seoApp').factory('SiteService', ['$http', function($http) {
  var service = {}, urlUtils = require('urlUtils'), site = {}, init;


  init = function() {
    $http.get('seo-data.json').success(function(json) {
      var address = json.address,
        pages = json.pages || [],
        urls = [];

      for (var i in pages) {
        var page = pages[i];
        if (page.status !== 'success') {
          continue;
        }
        urls.push(page.url);
        page.name = urlUtils.relative(address, page.url);
        page.id = urlUtils.slug(page.name);
      }

      // Assign service data
      site = {address: address, urls: urls, pages: pages};
    });
  };
  service.getSite = function() {
    return site;
  };
  service.getPages = function() {
    return site.pages || [];
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