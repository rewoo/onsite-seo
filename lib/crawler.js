var q = require('q'),
    urlUtils = require('./urlUtils'),
    crawler = {};

/**
 * Opens a single address via phantomjs
 *
 * @param {string} address
 * @returns {object} Promise object with pageResult object.
 * @example
 *    crawler.crawlPage('http://www.rewoo.de').then(function(pageResult) {});
 */
crawler.crawlPage = function(address) {
  var deferred = q.defer(), isClosed = false;
  var page = require('webpage').create();

  // page instance should only be closed once
  var pageCloseSave = function() {
    if (!isClosed) {
      isClosed = true;
      page.close();
    }
  };

  page.onConsoleMessage = function(msg) {
    console.log(address+"> "+msg);
  };

  // Catch and print errors
  page.onError = function(msg, trace) {
    if (typeof msg === 'Array' && msg.length === 2) {
      trace = msg[1];
      msg = msg[0];
    }
    var msgStack = ['Error on '+address+': '+msg];
    if (trace && trace.length) {
        msgStack.push('TRACE:');
        trace.forEach(function(t) {
            msgStack.push(' -> ' + t.file + ': ' + t.line + (t.function ? ' (in function "' + t.function + '")' : ''));
        });
    }
    console.error(msgStack.join('\n'));
  };

  page.open(address, function(status) {
    if (status !== 'success') {
      console.log('Failed to load '+address+' with status ' + status);
      deferred.reject({url: address, err: "Load error", status: status});
      pageCloseSave();
    } else {
      if (!page.injectJs("jquery-1.10.1.min.js")) {
        deferred.reject({url: address, err: 'Could not inject jquery', status: status});
      } else if (!page.injectJs("lib/inspectorBundle.js")) {
        deferred.reject({url: address, err: 'Could not inject inspector', status: status});
      } else {
        var pageResult = page.evaluate(function() {
          return require('inspector').inspect();
        });
        pageResult.url = address;
        pageResult.status = status;
        pageResult = urlUtils.categorizeLinks(pageResult);

        deferred.resolve(pageResult);
      };
      pageCloseSave();
    }
  });
  return deferred.promise;
};

/**
 * Crawl a address. This function is used recursivly.
 *
 * @param {string} address URL address to crawl
 * @param {object} options Optional crawl options.
 * @param {object} siteResult Result object. Should not be set.
 * @param {number} depth Crawl depth. Should not be set.
 * @returns {object} Returns a promise.
 *
 * @example
 *    crawler.crawl('http://www.rewoo.de').then(function(siteResult) {});
 *
 * @example
 *    crawler.crawl('http://www.rewoo.de', {max: 100, maxDepth: 3}).then(function(siteResult) {});
 */
crawler.crawl = function(address, options, siteResult, depth) {
  var url = urlUtils.resolveUrl(address, ''), deferred = q.defer();
  options = options || { max: 0, maxDepth: 3 };
  siteResult = siteResult || { address: urlUtils.base(url), urls: [], pages: [] };
  depth = depth || 0;

  if (depth >= options.maxDepth || (options.max > 0 && siteResult.urls.length > options.max)) {
    deferred.resolve(siteResult);
    return deferred.promise;
  }

  console.log("Fetch " + url);
  if (siteResult.urls.indexOf(url) < 0) {
    siteResult.urls.push(url);
  }

  crawler.crawlPage(url).then(function(pageResult) {
    siteResult.pages.push(pageResult);

    if (pageResult.links && pageResult.links.localUrls) {
      var promises = [];

      for (var i in pageResult.links.localUrls) {
        var link = urlUtils.resolveUrl(url, pageResult.links.localUrls[i]);
        if (siteResult.urls.indexOf(link) < 0 && urlUtils.isHttpProtocol(address, link)) {
          siteResult.urls.push(link);
          promises.push(crawler.crawl(link, options, siteResult, depth + 1));
        }
      };

      q.all(promises).then(function() {
        deferred.resolve(siteResult);
      });
    } else {
      deferred.resolve(siteResult);
    }
  }, function(error) {
    deferred.reject(error);
  });
  return deferred.promise;
};

module.exports = crawler;