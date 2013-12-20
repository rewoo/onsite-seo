/**
 * WASTE: Wicked and stupid template engine
 */
var fs = require('fs'),
    template = {};

/**
 * Resolve key breadcrumb of object recursivly
 *
 * @param {array} keys
 * @param {object} o
 * @returns {String} Replaced value
 */
template.resolve = function(keys, o) {
  if (keys.length === 0) {
    return '' + o;
  }
  var key = keys.shift();
  if (o.hasOwnProperty(key)) {
    return template.resolve(keys, o[key]);
  }
  // No replacement found
  return '';
};

template.render = function(tpl, map) {
  return tpl.replace(/{{([^}]*)}}/g, function(match, key) {
    return template.resolve(key.replace(/(^\s+|\s+$)/g, '').split('.'), map);
  });
};

template.renderFile = function(filename, map) {
  var file = './templates/' + filename;
  if (!fs.exists(file)) {
    console.log('Template file not found: ' + file);
    return '';
  } else {
    return template.render(fs.read(file), map);
  }
};

module.exports = template;

