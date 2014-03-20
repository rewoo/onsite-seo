angular.module('d3', [])
  .factory('d3Service', ['$window', function($window){
    var d3 = $window.d3 || {};
    return {d3: d3};
  }]);