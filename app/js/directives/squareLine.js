angular.module('seoApp').directive("squareLine", ['$window', 'd3Service', 'SiteService', 'RatingService', function($window, d3Service, SiteService, RatingService) {
  return {
    restrict: "EAC",
    scope: {
      scores: '='
    },
    link: function(scope, element, attrs) {
      var d3 = d3Service.d3;
      var svg = d3.select(element[0]).append('svg');

      var size = parseInt(attrs.size) || 20,
          sizePadding = parseInt(attrs.sizePadding) || 4;

      $window.onresize = function() {
        scope.$apply();
      };

      scope.data = false;
      scope.$watch(function() {
        return scope.scores;
      }, function() {
        scope.render();
      });

      scope.$watch(function() {
        return angular.element($window)[0].innerWidth;
      }, function() {
        scope.render();
      });

      scope.render = function() {
        var data = scope.scores;
        svg.selectAll('*').remove();

        if (!data || !data.length) return;

        var width = data.length * (size + sizePadding) + sizePadding,
            height = size + 2 * sizePadding,
            totalWeight = d3.sum(data, function(d) { return d.rating.weight; });
            rScale = d3.scale.linear()
              .domain([d3.min(data, function(d) { return d.rating.weight; }), d3.max(data, function(d) { return d.rating.weight; })])
              .range([4, size]);


        // set the height based on the calculations above
        svg
            .attr('height', height)
            .attr('width', width);

        var g = svg.append("g").attr("class", "scores");

        var circles = g.selectAll('rect')
            .data(data)
            .enter()
            .append('rect');

        circles
            .attr('x', function(d, j) {
              return (j + 1) * (size + sizePadding) - rScale(data[j].rating.weight) / 2 - size / 2;
            })
            .attr('y', function(d, j) {
              return (size + sizePadding) - rScale(data[j].rating.weight) / 2 - size / 2;
            })
            .attr('width', function(d, j) {
              return rScale(data[j].rating.weight);
            })
            .attr('height', function(d, j) {
              return rScale(data[j].rating.weight);
            })
            .style("fill", function(d) {
              var h = (120 * d.score.score).toFixed(0), s = 100, l = (25 * (1 - d.score.score) + 25).toFixed(0);
              return d3.rgb("hsl(" + h + "," + s + "%,"+ l + "%)");
            })
            .on('mouseover', function(d) {
              var weight = (100 * d.rating.weight / totalWeight).toFixed(2);
              var title = 'Rating: ' + d.rating.title + ', Score: ' + (d.score.score.toFixed(2)) + " (" + weight + "% weight)";
              element[0].setAttribute('title', title);
            });

      };
    }
  };
}]);