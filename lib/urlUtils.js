var utils = {};

utils.resolveUrl = function(base, url) {
  base = base.replace(/\/+$/, '');
  url = url.replace(/#.*$/, '');
  var host = utils.host(base);

  // Return url if it has a protocol like http:, mailto: or javascript:
  if (url.match(/^\w+:/)) {
    return url;
  }

  if (url.charAt(0) === '/') {
    return utils.host(base) + url;
  }
  if (url.indexOf('..') === 0) {
    var baseParts = base.split('/'), urlParts = url.split('/');
    if (host !== base && base.match(/\.\w+$/)) {
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
    if (host !== base && base.match(/\.\w+$/)) {
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

utils.getProtocol = function(address, url) {
  var protocol = url.match(/^(\w+):/);
  if (protocol) {
    return protocol[1].toLowerCase();
  }
  if (url.match(/^\/\//) && address.match(/^(\w+):/)) {
    protocol = address.match(/^(\w+):/);
    return protocol[1].toLowerCase();
  }
  return '';
};

utils.isHttpProtocol = function(address, url) {
  var protocol = utils.getProtocol(address, url);
  return protocol === 'http' || protocol === 'https';
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