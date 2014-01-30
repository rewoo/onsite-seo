var fs = require('fs'),
    crawler = require('./lib/crawler'),
    system = require('system'),
    i, address, options = {
      max: 0,
      maxDepth: 3,
      report: 'report.html',
      dataOnly: false
    };

if (system.args.length === 1) {
  console.log('Usage: ' + system.args[0] + '[options] <URL>');
  console.log('');
  console.log('Options:');
  console.log('  -m, --max-pages n    Number of maximum pages. Crawl all when set to 0. Default is 0');
  console.log('  -d, --max-depth n    Maximum crawl depth. Default is 3');
  console.log('  -r, --report name    Report filename. Default is report.html');
  console.log('  -n, --data-only      Crawl only data');
  phantom.exit();
}

// Parse arguments
i = 0;
while (i < system.args.length) {
  var arg = system.args[i];
  if (arg.match(/^-/)) {
    i++;
    if (arg === '-n' || arg === '--data-only') {
      options.dataOnly = true;
    } else if (i < system.args.length) {
      var value = system.args[i];
      if (arg === '-m' || arg === '--max-pages') {
        options.max = Math.max(0, parseInt(value));
      } else if (arg === '-d' || arg === '--max-depth') {
        options.maxDepth = Math.max(0, parseInt(value));
      } else if (arg === '-r' || arg === '--report') {
        options.report = value;
      }
    } else {
      console.log('Parameter missing for ' + arg);
    }
  } else {
    address = arg;
  }
  i++;
}

crawler.crawl(address, options).then(function(result) {
  var html;

  // unify page results
  if (result.pages) {
    var uniqueUrls = [];
    for (var i = result.pages.length - 1; i >= 0; i--) {
      if (uniqueUrls.indexOf(result.pages[i].url) < 0) {
        uniqueUrls.push(result.pages[i].url)
      } else {
        result.pages.splice(i, 1);
      }
    }
  }

  if (!options.dataOnly) {
    var report = require('./lib/report')
    html = report.generateReport(result);
    fs.write(options.report, html, 'w');
  } else {
    fs.write('seo-data.json', JSON.stringify(result), 'w');
  }
  phantom.exit();
}, function (error) {
  console.log("An error occured: "+error.err);
  phantom.exit();
});


