angular.module('seoApp', ['ngRoute', 'd3']).config(['$routeProvider', function($routeProvider) {
    $routeProvider.
        when('/pages/:pageId', {
          templateUrl: 'partials/page.html',
          controller: 'PageCtrl'
        }).
        when('/pages', {
          templateUrl: 'partials/pageList.html',
          controller: 'PageListCtrl'
        }).
        when('/ratings/:ratingSlug', {
          templateUrl: 'partials/rating.html',
          controller: 'RatingCtrl'
        }).
        when('/ratings', {
          templateUrl: 'partials/ratingList.html',
          controller: 'RatingListCtrl'
        }).
        when('/properties/:propertySlug', {
          templateUrl: 'partials/property.html',
          controller: 'PropertyCtrl'
        }).
        when('/properties', {
          templateUrl: 'partials/propertyList.html',
          controller: 'PropertyListCtrl'
        }).
        when('/search', {
          templateUrl: 'partials/search.html',
          controller: 'SearchCtrl'
        }).
        when('/home', {
          templateUrl: 'partials/home.html',
          controller: 'HomeCtrl'
        }).
        otherwise({
          redirectTo: '/home'
        });
  }]);
;