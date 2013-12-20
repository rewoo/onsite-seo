require=(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);throw new Error("Cannot find module '"+o+"'")}var f=n[o]={exports:{}};t[o][0].call(f.exports,function(e){var n=t[o][1][e];return s(n?n:e)},f,f.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
var defaults = [
  {
    title: 'Title and H1 comparison',
    description: 'Title should be different to H1',
    max: 10,
    group: 'Headers',
    rateFn: function(page) {
      var uniqueWords = 0, ratio,
          titleWords = page.meta.title.toLowerCase().split(/\s+/).sort(),
          h1Words = [], h1List = page.headers.all.filter(function(e) { return e.level === 'h1'; });

      if (h1List.length) {
        h1Words = h1List[0].text.toLowerCase().split(/\s+/).sort();
      }

      for (var i in titleWords) {
        if (h1Words.indexOf(titleWords[i]) < 0) {
          uniqueWords++;
        }
      }
      for (var i in h1Words) {
        if (titleWords.indexOf(h1Words[i]) < 0) {
          uniqueWords++;
        }
      }
      ratio = uniqueWords / (titleWords.length + h1Words.length);
      return ratio * 10;
    }
  },
  {
    title: 'Headers',
    description: 'Only one H1 per page and lower level should have higher level',
    group: 'Headers',
    max: 10,
    rateFn: function(page) {
      var score = 10,
          minPerLevel = 4,
          headers = page.headers.all,
          levelCounts = [],
          suggestions = [];

      for (var i in headers) {
        var level = parseInt(headers[i].level.replace(/\D+/, ''));
        if (level <= 0) {
          // Skip invalids level
          continue;
        }
        if (level > levelCounts.length) { // increase level
          while (level > levelCounts.length) {
            if (level > levelCounts.length + 1) {
              suggestions.push('Header level missmatch at level ' + (levelCounts.length + 1) + ' for Header ' + headers[i].level + ': ' + headers[i].text + '');
              score -= 3;
            }
            levelCounts.push(0);
          }
        } else if (level < levelCounts.length) { // decrease level
          while (level < levelCounts.length) {
            if (levelCounts[levelCounts.length - 1] < minPerLevel) {
              suggestions.push('Header count of level ' + levelCounts.length + ' should be at least ' + minPerLevel + ' (Header: ' + headers[i].text + ')');
              score--;
            }
            levelCounts.pop();
          }
        }
        levelCounts[levelCounts.length - 1]++;
      }
      if (!levelCounts.length) {
        // no headers found
        score = 0;
      } else {
        while (levelCounts.length > 0) {
          var count = levelCounts[levelCounts.length - 1];
          if (levelCounts.length === 1 && count !== 1) {
            suggestions.push('Only one H1 should exists. Found ' + levelCounts[0]);
            score -= 2;
          } else if (levelCounts.length > 1 && count < minPerLevel) {
            suggestions.push('Header count of level ' + levelCounts.length + ' is ' + count + ' but should be at least ' + minPerLevel);
            score--;
          }
          levelCounts.pop();
        }
      }
      return {score: score, suggestions: suggestions};
    }
  },
  {
    title: 'Text Ratio',
    description: 'Text to Stite markup should be larger than 50%',
    max: 10,
    rateFn: function(page) {
      var lower = 0.2,
          upper = 0.6,
          score = (page.text.textRatio - 0.2) * (10 / (upper - lower)),
          result = {score: score, value: page.text.textRatio, suggestions: []};
      if (result.score <= 5) {
        var perCent = Math.ceil(page.text.textRatio * 100);
        result.suggestions.push('Your text to html markup ratio is very low with ' + perCent + '%');
      }
      return result;
    }
  }];

// Set defaults
for (var i in defaults) {
  defaults[i].group = defaults[i].group || 'Text';
  defaults[i].scope = 'page';
}

module.exports = defaults;
},{}],2:[function(require,module,exports){
var urlUtils = require('./urlUtils'),
    minExternalLinks = 3,
    minInternalLinks = 6,
    links;

links = [
  {
    title: 'External Link Count',
    description: 'Page should have at least ' + minExternalLinks + ' external links',
    max: minExternalLinks,
    rateFn: function(page) {
      var count = page.links.externalUrls.length, threshold = Math.ceil(minInternalLinks * 0.5);
      if (count < threshold) {
        return {score: count, suggestions: ['You have only ' +  count + ' external links']};
      }
      return count;
    }
  },
  {
    title: 'Local Link Count',
    description: 'Page should have at least ' + minInternalLinks + ' local links',
    max: minExternalLinks,
    rateFn: function(page) {
      var count = page.links.localUrls.length, threshold = Math.ceil(minInternalLinks * 0.5);
      if (count < threshold) {
        return {score: count, suggestions: ['You have only ' +  count + ' local links']};
      }
      return count;
    }
  },
  {
    title: 'Valid local links',
    description: 'Page should have valid local links',
    max: 20,
    rateFn: function(page, site) {
      var links = page.links.localUrls,
          invalidCount = 0,
          urls = site.urls,
          suggestions = [],
          ratio, result;

      for (var i in links) {
        var resolved = urlUtils.resolveUrl(page.url, links[i]);
        if (urls.indexOf(resolved) < 0) {
          suggestions.push('Found invalid link to ' + links[i] + ' (' + resolved + ')');
          invalidCount++;
        }
      }
      ratio = invalidCount / Math.max(1, links.length);

      // Count ratio by 3/4 and absolute count by 1/4 of maximum 20 points
      result = 20 - ((ratio * 15) + (Math.min(5, invalidCount)));
      if (result < 15) {
        suggestions.push('You have ' + invalidCount + ' invalid linux of ' + links.length + ' local links');
      }
      return {score: result, value: ratio, suggestions: suggestions};
    }
  },
  {
    title: 'Valid References',
    description: 'Page should have valid cross references',
    max: 5,
    rateFn: function(page, site) {
      var links,
          suggestions = [],
          invalidReferences = 0;

      links = page.links.all.filter(function(e) {
        return e.href.indexOf('#') > 0 && urlUtils.isLocalUrl(site.address, urlUtils.resolveUrl(page.url, e.href));
      });

      for (var i in links) {
        var refUrl = urlUtils.resolveUrl(page.url, links[i].href);
        var anchor = links[i].href.replace(/.*#/, '');
        for (var j in site.pages) {
          if (site.pages[j].url === refUrl) {
            if (site.pages[j].html.ids.indexOf(anchor) < 0) {
              suggestions.push('Reference ' + links[i].href + ' not found')
              invalidReferences++;
            }
          }
        }
      }
      return {score: 5 - invalidReferences, value: invalidReferences, suggestions: suggestions};
    }
  },
  {
    title: 'Duplicate Link text ratio',
    description: 'Link texts should be different',
    max: 5,
    rateFn: function(page, site) {
      var linkTexts = [],
          tmp = '',
          duplicates = 0,
          ratio,
          suggestions = [],
          score = 5;

      for (var i in page.links.all) {
        linkTexts.push(page.links.all[i].text);
      }
      linkTexts = linkTexts.sort();
      for (var i in linkTexts) {
        if (tmp === linkTexts[i]) {
          duplicates++;
        }
        tmp = linkTexts[i];
      }
      ratio = duplicates / linkTexts.length;
      if (ratio > .2) {
        suggestions.push('You have a link duplication text rate of ' + ratio.toFixed(2));
      }
      score -= ratio * 5;
      return {score: score, value: ratio, suggestions: suggestions};
    }
  }
];

// Set defaults
for (var i in links) {
  links[i].max = links[i].max || 10;
  links[i].group = links[i].group || 'Links';
  links[i].scope = 'page';
}

module.exports = links;


},{"./urlUtils":"6JhtOs"}],3:[function(require,module,exports){
var meta = [
  {
    title: 'Keyword Count',
    description: 'At least 5 keywords',
    max: 5,
    rateFn: function(page) {
      if (!page.meta.keywords) {
        return {score: 0, value: 0, suggestions: ['Add at least 5 keywords via mata tag']};
      } else {
        var keywords = page.meta.keywords.split(/\s*,\s*/), suggestions = [], score = 5;
        for (var i in keywords) {
          if (keywords[i].length < 4) {
            suggestions.push('Keyword ' + keywords[i] + ' is too short (less than 4 chars)');
            score -= 0.4;
          } else if (keywords[i].length > 20) {
            suggestions.push('Keyword ' + keywords[i] + ' is too long (more than 20 chars)');
            score -= 0.3;
          }
        }
        return {score: score, value: keywords.length, suggestions: suggestions};
      }
    }
  },
  {
    title: 'Keywords in text',
    description: 'Text should contain the keywords',
    max: 10,
    rateFn: function(page) {
      if (!page.meta.keywords) {
        return 0;
      } else {
        var score = 0,
            count = 0,
            keywords = page.meta.keywords.split(/\s*,\s*/),
            text = page.text.text.toLowerCase();

        for (var i in keywords) {
          text.replace(new RegExp(keywords[i], 'gi'), function() {
            count++;
            return '';
          });
        }
        score += 0.5 * count;
        return {score: score, value: count};
      }
    }
  },
  {
    title: 'Site Language',
    description: 'Languge should be set in html or meta tag',
    max: 10,
    rateFn: function(page) {
      if (page.html.lang && page.html.lang.length || page.meta.lang && page.meta.lang.length) {
        return 10;
      }
      return 0;
    }
  },
  {
    title: 'Meta description length',
    description: 'Description should be between 70 and 160 chars',
    max: 10,
    rateFn: function(page) {
      var description = page.meta.description || '', score = 10, charPoints = 0.3, suggestions = [];
      if (description.length < 70) {
        score -= (70 - description.length) *  charPoints;
      } else if (description.length > 160) {
        score -= (description.length - 160) *  charPoints;
      }
      if (score < 7) {
        suggestions.push('Improve your description length which is ' + description.length);
      }
      return {score: score, value: description.length, suggestions: suggestions};
    }
  },
  {
    title: 'Meta title length',
    description: 'Title should be between 10 and 70 chars',
    max: 10,
    rateFn: function(page) {
      var title = page.meta.title || '', score = 10, charPoints = 0.6, suggestions = [];
      if (title.length < 10) {
        score -= (10 - title.length) *  charPoints;
      } else if (title.length > 70) {
        score -= (title.length - 70) *  charPoints;
      }
      if (score < 7) {
        suggestions.push('Improve your title length which is ' + title.length);
      }
      return {score: score, value: title.length, suggestions: suggestions};
    }
  }
];

for (var i in meta) {
  meta[i].group = 'Meta';
  meta[i].scope = 'page';
}

module.exports = meta;
},{}],"El9Hrp":[function(require,module,exports){
var metaRatings = require('./ratings-meta'),
    defaultRatings = require('./ratings-default'),
    linkRatings = require('./ratings-links'),
    ratings = {fn: []};

ratings.getPageSummary = function(page) {
  var h1 = page.headers.all.filter(function(e) { return e.level === 'h1'; });
  var headerOrder = [];
  for (var i in page.headers.all) { headerOrder.push(page.headers.all[i].level); }
  var h1Counts = page.headers.all.filter(function(e) { return e.level === 'h1'; }).length;
  var h2Counts = page.headers.all.filter(function(e) { return e.level === 'h2'; }).length;
  var h3Counts = page.headers.all.filter(function(e) { return e.level === 'h3'; }).length;

  var result = [
    {title: 'Title', value: page.meta.title},
    {title: 'Description', value: page.meta.description},
    {title: 'Keywords', value: page.meta.keywords},
    {title: 'Language', value: [page.html.lang, page.meta.lang].join(', ')},
    {title: 'Header Order', value: headerOrder.join(', ')},
    {title: 'H1', value: h1[0].text},
    {title: 'H1 Counts', value: h1Counts},
    {title: 'H2 Counts', value: h2Counts},
    {title: 'H3 Counts', value: h3Counts}
  ];
  return result;
};


/**
 * Return linear points for given score and maximum score
 *
 * @param {number} score Current score
 * @param {number} max Maximum score value
 * @param {number} maxPoints Optional maximum points. Default is 5.
 * @returns {Number} Normalized points from 1 to maximum points
 */
ratings.getPoints = function(score, max, maxPoints) {
  maxPoints = maxPoints || 5;
  return Math.max(1, Math.ceil(maxPoints * (Math.min(max, score) / max)));
};

/**
 * Proxy rating function to validate result
 *
 * @param {function} rateFn Ratingfunction to proxy
 * @param {number} max Maximum score value
 * @return {object} Rating result with score, value and suggestions
 */
ratings.proxyRateFn = function(rateFn, max) {
  return function(page, site) {
    var rateResult = rateFn(page, site), result;
    if (typeof(rateResult) !== 'object') {
      result = {score: Math.max(0, Math.min(rateResult, max)), value: rateResult, suggestions: []};
    } else {
      if (typeof(rateResult.score) === 'number') {
        rateResult.score = Math.max(0, Math.min(rateResult.score, max));
      }
      if (typeof(rateResult.suggestions) === 'undefined') {
        rateResult.suggestions = [];
      }
      if (typeof(rateResult.value) === 'undefined') {
        rateResult.value = rateResult.score;
      }
      result = rateResult;
    }
    result.points = ratings.getPoints(result.score, max);
    return result;
  };
};

/**
 * Add a rating function
 *
 * @param {type} o Rating object with at least title and rateFn().
 * @returns {undefined} None
 */
ratings.addRating = function(o) {
  var required = {title: 'string', rateFn: 'function'},
      defaults = {
        description: '',
        max: 10, // max score
        group: 'default',
        scope: 'page'
      },
      ratingProxy = {};

  // Validate rating object
  for (var key in required) {
    var tmpType = typeof(o[key]);
    if (required.hasOwnProperty(key) && tmpType !== required[key]) {
      if (tmpType === 'undefined') {
        console.log('Required property ' + key + ' is missing of ' + o.title);
      } else {
        console.log('Type ' + tmpType + ' should be type ' + required[key] + ' of property ' + key + ' in ' + o.title);
      }
      return;
    }
    ratingProxy[key] = o[key];
  }

  // Add defaults
  for (var key in defaults) {
    if (defaults.hasOwnProperty(key) && typeof(o[key]) === 'undefined') {
      ratingProxy[key] = defaults[key];
    } else if (key !== 'rateFn') {
      ratingProxy[key] = o[key];
    }
  }

  ratingProxy.rateFn = ratings.proxyRateFn(o.rateFn, ratingProxy.max);

  ratings.fn.push(ratingProxy);
};

/**
 * Add a list of rating functions
 *
 * @param {array} a Array of ratings functions
 */
ratings.addRatings = function(a) {
  for (var i in a) {
    ratings.addRating(a[i]);
  }
};

/**
 * Return list of rating functions
 *
 * @return {array}
 */
ratings.getRatings = function() {
  return ratings.fn;
};

/**
 * Get list of rating groups
 *
 * @returns {array} List of rating groups
 */
ratings.getGroups = function() {
  var groups = [], fns = ratings.getRatings();
  for (var i in fns) {
    var group = fns[i].group;
    if (groups.indexOf(group) < 0) {
      groups.push(group);
    }
  }
  return groups;
};

/**
 *
 * @param {string} group Group name
 * @returns {array} List of rating functions
 */
ratings.getRatingsByGroup = function(group) {
  var result = [], fns = ratings.getRatings();
  for (var i in fns) {
    if (fns[i].group === group) {
      result.push(fns[i]);
    }
  }
  return result;
};

/**
 * Get maximum score value of given rating functions
 *
 * @param {array} fns List of rating functions
 * @result {number} Maximum score value
 */
ratings.getMaxScoreOfRatings = function(fns) {
  var result = 0;
  for (var i in fns) {
    result += fns[i].max;
  }
  return result;
};

/**
 * Get maximum ratings of all rating functions
 *
 * @return {number} maximum score value
 */
ratings.getMaxScore = function() {
  return ratings.getMaxScoreOfRatings(ratings.getRatings());
};

ratings.addRatings(metaRatings);
ratings.addRatings(defaultRatings);
ratings.addRatings(linkRatings);

module.exports = ratings;
},{"./ratings-default":1,"./ratings-links":2,"./ratings-meta":3}],"ratings":[function(require,module,exports){
module.exports=require('El9Hrp');
},{}],"6JhtOs":[function(require,module,exports){
var utils = {};

utils.resolveUrl = function(base, url) {
  base = base.replace(/\/+$/, '');
  url = url.replace(/^\/+/, '').replace(/#.*$/, '');
  
  if (url.indexOf('http') === 0 || url.indexOf('mailto') === 0) {
    return url;
  }
  
  if (url.indexOf('..') === 0) {
    var baseParts = base.split('/'), urlParts = url.split('/');
    if (base.match(/\.\w+$/)) {
      baseParts.pop();
    }

    while (urlParts.length && urlParts[0] === '..') {
      baseParts.pop();
      urlParts.shift();
    }
    if (urlParts.length) {
      return baseParts.join('/') + '/' + urlParts.join('/');
    } else {
      return baseParts.join('/');
    }
  }
  if (url) {
    if (base.match(/\.\w+$/)) {
      var baseParts = base.split('/');
      baseParts.pop();
      base = baseParts.join('/');
    }
    return base + '/' + url;
  } else {
    return base;
  }
};
utils.host = function(url) {
  return url.replace(/((\w+:\/\/)?[^/]+)(.*)/, '$1');
};
utils.isLocalUrl = function(base, url) {
  var host = utils.host(base);
  return utils.resolveUrl(base, url).indexOf(host) === 0;
};
utils.isSelfLink = function(url) {
  return url.indexOf('#') === 0;
};

utils.categorizeLinks = function(page) {
  if (page.links && page.links.all) {
    page.links.selfUrls = [];
    page.links.localUrls = [];
    page.links.externalUrls = [];

    for (var i in page.links.all) {
      var link = page.links.all[i].href;
      if (utils.isSelfLink(link)) {
        page.links.selfUrls.push(link);
      } else if (utils.isLocalUrl(page.url, link)) {
        page.links.localUrls.push(link);
      } else {
        page.links.externalUrls.push(link);
      }
    }
  }
  return page;
};

utils.isTextUrl = function(url) {
  return url.replace(/#.*$/, '').match(/\.(html?|txt|php)/i);
};
utils.slug = function(url) {
  return url.replace(/\.\w{3,4}/, '').replace(/[^A-Za-z0-9]/g, '-').toLowerCase();
};
utils.relative = function(base, url) {
  if (url.indexOf(base) === 0) {
    return url.substr(base.length + 1).replace(/^\//, '');
  }
  return url;
};

module.exports = utils;
},{}],"urlUtils":[function(require,module,exports){
module.exports=require('6JhtOs');
},{}]},{},["El9Hrp","6JhtOs"])