var properties = {fns: []};

/**
 * Proxy function to validate result
 *
 * @param {function} fn Property function to proxy
 * @return {string} Result value
 */
properties.proxyFn = function(fn) {
  return function(page, site) {
    var propertyResult = fn(page, site);
    return ''+propertyResult;
  };
};

/**
 * Add a property function
 *
 * @param {type} o Property object with at least title and fn().
 * @returns {undefined} None
 */
properties.addProperty = function(o) {
  var required = {title: 'string', fn: 'function'},
      defaults = {
        description: '',
        group: 'default',
        scope: 'page'
      },
      fnProxy = {};

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
    fnProxy[key] = o[key];
  }

  // Add defaults
  for (var key in defaults) {
    if (defaults.hasOwnProperty(key) && typeof(o[key]) === 'undefined') {
      fnProxy[key] = defaults[key];
    } else if (key !== 'fn') {
      fnProxy[key] = o[key];
    }
  }

  fnProxy.fn = properties.proxyFn(o.fn);

  properties.fns.push(fnProxy);
};

/**
 * Add a list of rating functions
 *
 * @param {array} a Array of ratings functions
 */
properties.addProperties = function(a) {
  for (var i in a) {
    properties.addProperty(a[i]);
  }
};

/**
 * Return list of rating functions
 *
 * @return {array}
 */
properties.getProperties = function() {
  return properties.fns;
};

/**
 * Get list of rating groups
 *
 * @returns {array} List of rating groups
 */
properties.getGroups = function() {
  var groups = [], fns = properties.getProperties();
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
properties.getPropertiesByGroup = function(group) {
  var result = [], fns = properties.getProperties();
  for (var i in fns) {
    if (fns[i].group === group) {
      result.push(fns[i]);
    }
  }
  return result;
};

properties.addProperties(require('./properties/meta'));
properties.addProperties(require('./properties/header'));
properties.addProperties(require('./properties/link'));
properties.addProperties(require('./properties/image'));

module.exports = properties;