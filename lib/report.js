var template = require('./template'),
    utils = require('./urlUtils'),
    ratings = require('./ratings'),
    report = {};

report.reportPage = function(title, page, site) {
  var reportTemplate = "<h3>{{title}}</h3>\n{{header}}\n<table>\n{{rows}}\n</table>\n{{footer}}";
  var rowTemplate = "<tr><td>{{title}}</td><td>{{value}}</td></tr>\n";
  var scoreTemplate = "<p>Score: {{score}} of {{max}}</p>\n";
  var suggestionsTemplate = "<p>{{count}} Suggestions:</p>\n<ul>{{suggestionsList}}</ul>\n";
  var errorTemplate = "<h3>{{url}}</h3><p>Error: {{err}}</p>";

  if (page.err) {
    return template.render(errorTemplate, {url: page.url, err: page.err});
  }
  var summary = ratings.getPageSummary(page);

  var content = '';
  var rows = '';
  for (var i in summary) {
    rows += template.render(rowTemplate, summary[i]);
  }
  content += template.render(reportTemplate, {title: 'Summary', rows: rows});

  var groups = ratings.getGroups();
  for (var i in groups) {
    var group = groups[i],
        fns = ratings.getRatingsByGroup(group),
        score = 0,
        suggestions = [],
        max = ratings.getMaxScoreOfRatings(fns),
        footer = '',
        header;

    rows = '';
    for (var j in fns) {
      var result = fns[j].rateFn(page, site);
      score += result.score;
      suggestions.push.apply(suggestions, result.suggestions);
      rows += template.render(rowTemplate, {title: fns[j].title, value: result.score.toFixed(2) });
    }

    header = template.render(scoreTemplate, {score: score.toFixed(2), max: max});
    if (suggestions.length) {
      footer = template.render(suggestionsTemplate, {count: suggestions.length, suggestionsList: '<li>' + suggestions.join('</li><li>') + '</li>'});
    }
    content += template.render(reportTemplate, {title: 'Group ' + group, rows: rows, header: header, footer: footer});
  }
  return template.renderFile('pageSummary.html', {id: utils.slug(title), url: page.url, content: content, title: title});
};

report.reportProperty = function(site, rating) {
  var propertyTemplate = "<div id=\"{{id}}\" class=\"row\"><h2>{{title}}</h2>\n<p>{{description}}<table>{{rows}}</table>\n</div>\n\n";
  var rowTemplate = "<tr><td><a href=\"#{{id}}\">{{title}}</a></td><td>{{score}}</tr>\n";

  var rows = '';
  for (var i in site.pages) {
    var page = site.pages[i];
    if (page.err) {
      continue;
    }

    var title = utils.relative(site.address, page.url),
        result = rating.rateFn(page, site);
    rows += template.render(rowTemplate, {id: utils.slug(title), title: title, score: result.score.toFixed(2)});
  }
  return template.render(propertyTemplate, {id: utils.slug(rating.title), rows: rows, title: rating.title, description: rating.description});
};

report.reportProperties = function(site) {
  var properties = '', fns = ratings.getRatings();

  for (var i in fns) {
    properties += report.reportProperty(site, fns[i]);
  }
  return properties;
};

report.listPages = function(site) {
  var listTempalte = '<div class="row"><h1>Pages</h1><ul>{{items}}</ul></div>';
  var liTemplate = '<li><a href="#{{id}}">{{title}}</a></li>';

  var items = "";
  for (var i in site.pages) {
    var page = site.pages[i];
    var title = utils.relative(site.address, page.url);
    items += template.render(liTemplate, {id: utils.slug(title), title: title});
  }
  return template.render(listTempalte, {items: items});
};

report.generateReport = function(site) {
  var bodyTemplate = "{{list}} {{pages}} {{properties}}";
  var pages = '';

  site.pages.sort(function(p1, p2) {
    if (p1.url < p2.url) {
      return -1;
    } else if (p1.url > p2.url) {
      return 1;
    }
    return 0;
  });

  for (var i in site.pages) {
    var page = site.pages[i];
    var title = utils.relative(site.address, page.url);
    pages += report.reportPage(title, page, site);
  }
  var content = template.render(bodyTemplate, {
    list: report.listPages(site),
    pages: pages,
    properties: report.reportProperties(site)
  });

  return template.renderFile('layout.html', {
    title: 'Report',
    css: 'http://cdn.jsdelivr.net/foundation/5.0.2/css/foundation.min.css',
    content: content,
    json: JSON.stringify(site)
  });
};

module.exports = report;