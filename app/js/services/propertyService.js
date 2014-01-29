angular.module('seoApp').factory('PropertyService', [function() {
  var service = {},
    properties = require('properties'),
    fns = properties.getProperties(),
    slug = require('urlUtils').slug,
    titles = [];

  for (var i in fns) {
    titles.push(fns[i].title);
  }

  service.isPropertyFunction = function(name) {
    return titles.indexOf(name) >= 0;
  };

  service.getPropertyBySlug = function(text) {
    for (var i in fns) {
      if (slug(fns[i].title) === text) {
        return fns[i];
      }
    }
    return null;
  };

  service.getAllPageProperties = function(site, pages) {
    var result = [];
    for (var i in fns) {
      var tmp = {title: fns[i].title, description: fns[i].description};
      result.push(tmp);
    };
    return result;
  };

  service.getAllPropertiesForPage = function(site, page) {
    var result = [];
    for (var j in fns) {
      var propertyValue = fns[j].fn(page, site);
      result.push({title: fns[j].title, value: propertyValue});
    }
    return result;
  };
  
  return service;
}]);