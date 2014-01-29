var url = require('url'),
  utils = {};

utils.resolveUrl = function(one, two) {
  var parsed = url.parse(two), result = two;
  if (!parsed.host || url.parse(one).host === parsed.host) {
    result = url.resolve(one, two);
  }
  //console.log("resolveUrl('"+one+"', '"+two+"')="+result);
  return result;
};

utils.host = function(u) {
  var parsed = url.parse(u);
  //console.log("host('"+u+"')="+parsed.host);
  return parsed.host;
};

utils.isLocalUrl = function(base, u) {
  var host = utils.host(base), resolved = utils.resolveUrl(base, u);
  return resolved.indexOf(host) >= 0;
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

utils.getProtocol = function(address, u) {
  var resolve = utils.resolveUrl(address, u), parsed = url.parse(resolve), result = parsed.protocol.replace(/:$/, '');
  //console.log("getProtocol('"+address+"', '"+u+"')="+result);
  return result;
};

utils.isHttpProtocol = function(address, u) {
  var protocol = utils.getProtocol(address, u);
  return protocol === 'http' || protocol === 'https';
};

utils.isTextUrl = function(url) {
  return url.replace(/#.*$/, '').match(/\.(html?|txt|php)$/i);
};

utils.slug = function(url) {
  return url.replace(/\.\w{3,4}/, '').replace(/[^A-Za-z0-9]/g, '-').toLowerCase();
};

utils.relative = function(base, u) {
  base = base.replace(/\/$/, '')
  if (u.indexOf(base) === 0) {
    return u.substr(base.length);
  }
  return u;
};

utils.base = function(base) {
  var parsed = url.parse(base);
  return url.format({protocol: parsed.protocol, auth: parsed.auth, host: parsed.host})
};

module.exports = utils;