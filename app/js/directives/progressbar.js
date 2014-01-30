angular.module('seoApp').directive("progressbar", function() {
  return {
    restrict: "E",
    scope: {
      progress: "="
    },
    template: 
          '<div class="progress">'+
          '  <div class="progress-bar" role="progressbar" aria-valuenow="{{percent}}" aria-valuemin="0" aria-valuemax="100">'+
          '    <span class="progress-text">{{percent | number:1 }}%</span>'+
          '  </div>'+
          '</div>',
    link: function(scope, element) {
      scope.percent = 0;
      scope.$watch("progress", function(value) {
        scope.percent = value * 100;
        var bar = element.children().children(), c;
        if (scope.percent < 33) {
          c = 'progress-bar-danger';
        } else if (scope.percent < 66) {
          c = 'progress-bar-warning';
        } else {
          c = 'progress-bar-success';
        }
        
        bar.css("width", scope.percent.toFixed(2) + "%").addClass(c);
      });
    }
  };
});