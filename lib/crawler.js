var q = require('q'),
    urlUtils = require('./urlUtils'),
    inspector = require('./inspector'),
    crawler = {};

/**
 * Opens a single addess via phantomjs
 *
 * @param {string} address
 * @returns {object} Promise object with pageResult object.
 * @example
 *    crawler.crawlPage('http://www.rewoo.de').then(function(pageResult) {});
 */
crawler.crawlPage = function(address) {
  var deferred = q.defer();
  var page = require('webpage').create();
  page.open(address, function(status) {
    if (status !== 'success') {
      console.log('Failed to load '+address+' with status ' + status);
      deferred.resolve({url: address, status: status});
    } else {
      page.includeJs("http://code.jquery.com/jquery-1.10.1.min.js", function() {
        var pageResult = page.evaluate(inspector.inspect);
        pageResult.url = address;
        pageResult.status = status;
        pageResult = urlUtils.categorizeLinks(pageResult);
        deferred.resolve(pageResult);
      });
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
  siteResult = siteResult || { address: urlUtils.host(url), urls: [], pages: [] };
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
        if (siteResult.urls.indexOf(link) < 0 && urlUtils.isTextUrl(link)) {
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
  });
  return deferred.promise;
};

module.exports = crawler;