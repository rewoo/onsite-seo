angular.module('seoApp').factory('StateService', [function() {
  return {
    showRating: {},
    showProperty: {
      H1: true,
      Description: true,
      Title: true,
      Keywords: true
    }
  };
}]);