var ratings = {fn: []};

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
    {title: 'H1', value: h1Counts ? h1[0].text : ''},
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
 * @param {function} rateFn Rating function
 * @param {obect} proxy Rating proxy object
 * @return {object} Rating result with score, value and suggestions
 */
ratings.proxyRateFn = function(rateFn, proxy) {
  return function(page, site) {
    var rateResult = rateFn(page, site), result;
    if (typeof(rateResult) !== 'object') {
      result = {score: rateResult, value: rateResult, suggestions: []};
    } else {
      if (typeof(rateResult.score) === 'undefined') {
        rateResult.score = 0.0;
      }
      if (typeof(rateResult.suggestions) === 'undefined') {
        rateResult.suggestions = [];
      }
      if (typeof(rateResult.value) === 'undefined') {
        rateResult.value = rateResult.score;
      }
      result = rateResult;
    }
    result.score = Math.max(0, Math.min(result.score, 1.0));
    result.weightedScore = result.score * proxy.weight;
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
        weight: 1, // score weight
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

  ratingProxy.rateFn = ratings.proxyRateFn(o.rateFn, ratingProxy);

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
ratings.getWeightSumOfRatings = function(fns) {
  var result = 0;
  for (var i in fns) {
    result += fns[i].weight;
  }
  return result;
};

/**
 * Get maximum ratings of all rating functions
 *
 * @return {number} maximum score value
 */
ratings.getWeightSum = function() {
  return ratings.getWeightSumOfRatings(ratings.getRatings());
};

ratings.addRatings(require('./ratings/keyword'));
ratings.addRatings(require('./ratings/meta'));
ratings.addRatings(require('./ratings/default'));
ratings.addRatings(require('./ratings/link'));

module.exports = ratings;