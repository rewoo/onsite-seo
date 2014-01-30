require=(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);throw new Error("Cannot find module '"+o+"'")}var f=n[o]={exports:{}};t[o][0].call(f.exports,function(e){var n=t[o][1][e];return s(n?n:e)},f,f.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({"inspector":[function(require,module,exports){
module.exports=require('pxJ2on');
},{}],"pxJ2on":[function(require,module,exports){
var lightdom = require('lightdom'),
  inspector = {};

var trim = function(s) {
  if (s) {
    return s.replace(/^\s+/, '').replace(/\s+$/, '');
  }
  return s;
};

var getHeaders = function(e) {
  var headers = [];
  var treeWalker = document.createTreeWalker(e, NodeFilter.SHOW_ELEMENT, {
    acceptNode: function(node) {
      if (node.nodeName.match(/h[1-9]/i)) {
        return NodeFilter.FILTER_ACCEPT;
      }
      return NodeFilter.FILTER_SKIP;
    }
  }, false);

  while (treeWalker.nextNode()) {
    var node = treeWalker.currentNode;
    headers.push({level: node.nodeName.toLowerCase(), text: trim($(node).text())});
  }
  return headers;
};

/**
 * Inspect a single page. The inspection must be within a single function.
 *
 * The function is executed in a sandbox and other functions can't be accessed.
 * See http://phantomjs.org/api/webpage/method/evaluate.html for mor details.
 *
 * @returns {object} Page result object
 */
inspector.inspect = function() {
  var result = {
    html: {},
    meta: {},
    links: {},
    headers: {},
    text: {},
    resources: {},
    media: {}
  };

  result.hasJQuery = (typeof($) !== 'undefined');
  if (result.hasJQuery) {
    result.html.lang = trim($("html[lang]").attr('lang'));
    result.html.ids = $.map($("[id]"), function(e) { return $(e).attr("id"); });
    result.html.lightDOM = lightdom.build(document.body);

    result.meta.lang = trim($("meta[http-equiv=content-language]").attr('content'));
    result.meta.title = trim($("title").text());
    result.meta.description = trim($("meta[name=description]").attr('content'));
    result.meta.keywords = (''+trim($("meta[name=keywords]").attr('content'))).split(/\s*,\s*/).filter(function(e) { return e; }).join(', ');

    result.links.all = $.map($("a[href]"), function(e) { return {href: $(e).attr("href"), title: $(e).attr('title'), text: trim($(e).text())}; });

    result.headers.all = getHeaders(document.body);

    result.text.text = lightdom.text(result.html.lightDOM).replace(/\s+/g, ' ').replace(/(^\s+|\s+$)/g, '');
    result.text.textSize = result.text.text.length;
    result.text.strong = $.map($("b"), function(e) { return $(e).text(); }).concat($.map($("strong"), function(e) { return $(e).text(); }));
    result.text.emphasis = $.map($("i"), function(e) { return $(e).text(); }).concat($.map($("em"), function(e) { return $(e).text(); }));
    result.text.htmlSize = $("html").html().replace(/\s+/g, ' ').length;
    result.text.textRatio = result.text.textSize / result.text.htmlSize;

    result.resources.externalScripts = $.map($("script[src]"), function(e) { return $(e).attr('src') ? false : $(e).attr('src'); });
    result.resources.inlineStyles = $("style").length;
    result.resources.styles = $.map($("link[rel=stylesheet]"), function(e) { return $(e).attr("href"); });

    result.media.images = $.map($("img[src]"), function(e) { return {src: $(e).attr("src"), alt: $(e).attr('alt'), width: $(e).attr('width'), height: $(e).attr('height')}; });
  }
  return result;
};

module.exports = inspector;
},{"lightdom":"c1XhJL"}],"c1XhJL":[function(require,module,exports){
var lightdom = {},
    attributeMap = {},
    extractAttrs,
    elements,
    excludes;

// Element names for light DOM. Syntax: name[:attr]*(,name[:attr]*)*
var elementNames = "h1,h2,h3,h4,p,ul,ol,li,img:title:src:width:height,blockquote," +
    "a:href:title,b,strong,i,em,br";
var excludeNames = "script,noscript,style,iframe";

// Extract required attributes from element name
extractAttrs = function(e) {
  var attributes = e.split(':');
  if (attributes.length > 1) {
    attributeMap[attributes[0]] = attributes.slice(1);
  }
  return attributes[0];
};

var elements = elementNames.split(',').map(extractAttrs);
var excludes = excludeNames.split(',');

/**
 * Extract a light DOM with elements and attributes of intrests
 *
 * @param {lightNode} node
 */
lightdom.build = function(node) {
  if (!node) {
    return [];
  }
  if (node.nodeType === node.TEXT_NODE) {
    if (!node.data.match(/^\s+$/)) {
      return [{type: 't', data: node.data}];
    }
    return [];
  };

  var name = node.nodeName.toLowerCase(), children = [], e;
  if (excludes.indexOf(name) >= 0) {
    return [];
  } else if (elements.indexOf(name) >= 0) {
    e = {type: 'e', name: name, children: [], attrs: {}};
    // Catch required attributes
    if (attributeMap[name]) {
      for (var i = 0, len = attributeMap[name].length; i < len; i++) {
        var a = attributeMap[name][i];
        e.attrs[a] = node.getAttribute(a);
      }
    }
  }

  // Traverse children recursivly
  for (var i = 0, len = node.childNodes.length; i < len; i++) {
    var child = lightdom.build(node.childNodes[i]);
    children = children.concat(child);
  }

  if (e) {
    e.children = e.children.concat(children);
    return [e];
  }
  return children;
};

lightdom.text = function(lightNode) {
  if (typeof lightNode === 'object' && ('length' in lightNode)) {
    var s = '';
    for (var i = 0, len = lightNode.length; i < len; i++) {
      s += lightdom.text(lightNode[i]);
    }
    return s;
  }
  if (lightNode.type === 't') {
    return lightNode.data;
  } else if (lightNode.type === 'e') {
    return lightdom.text(lightNode.children);
  }
};

lightdom.html = function(lightNode) {
  var singleNames = "br,img".split(':');
  if (typeof lightNode === 'object' && ('length' in lightNode)) {
    var s = '';
    for (var i = 0, len = lightNode.length; i < len; i++) {
      s += lightdom.html(lightNode[i]);
    }
    return s;
  }
  if (lightNode.type === 't') {
    return lightNode.data;
  } else if (lightNode.type === 'e') {
    var s = '<' + lightNode.name;
    for (var a in lightNode.attrs) {
      if (lightNode.attrs.hasOwnProperty(a) && lightNode.attrs[a]) {
        s += ' ' + a + '="' + lightNode.attrs[a] + '"';
      }
    }
    if (singleNames.indexOf(lightNode.name) >= 0) {
      return s + ' />';
    }
    return s + '>' + lightdom.html(lightNode.children) + '</' + lightNode.name + '>';
  }
  return '';
};

module.exports = lightdom;


},{}],"lightdom":[function(require,module,exports){
module.exports=require('c1XhJL');
},{}],"SkZC52":[function(require,module,exports){
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
},{"./properties/header":7,"./properties/image":8,"./properties/link":9,"./properties/meta":10}],"properties":[function(require,module,exports){
module.exports=require('SkZC52');
},{}],7:[function(require,module,exports){
var meta = [
  {
    title: 'H1',
    description: 'Page should have H1 header',
    fn: function(page) {
      var h1 = page.headers.all.filter(function(e) { 
        return e.level === 'h1'; 
      }).map(function(e) {
        return e.text;
      });
      return h1.join(', ');
    }
  },
  {
    title: 'Header Order',
    description: 'Shows the header orders',
    fn: function(page) {
      var order = page.headers.all.map(function(e) {
        return e.level;
      });
      return order.join(', ');
    }
  },
  {
    title: 'H1 Header Count',
    description: 'Shows header level counts',
    fn: function(page) {
      return page.headers.all.filter(function(e) { 
        return e.level === 'h1'; 
      }).length;
    }
  },
  {
    title: 'H2 Header Count',
    description: 'Shows header level counts',
    fn: function(page) {
      return page.headers.all.filter(function(e) { 
        return e.level === 'h2'; 
      }).length;
    }
  },
  {
    title: 'H3 Header Count',
    description: 'Shows header level counts',
    fn: function(page) {
      return page.headers.all.filter(function(e) { 
        return e.level === 'h3'; 
      }).length;
    }
  },
  {
    title: 'H4 Header Count',
    description: 'Shows header level counts',
    fn: function(page) {
      return page.headers.all.filter(function(e) { 
        return e.level === 'h4'; 
      }).length;
    }
  },
  {
    title: 'Headers Text',
    description: 'Shows the header orders',
    fn: function(page) {
      var order = page.headers.all.map(function(e) {
        return '(' + e.level + ') ' + e.text;
      });
      return order.join(', ');
    }
  }
];

for (var i in meta) {
  meta[i].group = 'Header';
  meta[i].scope = 'page';
}

module.exports = meta;
},{}],8:[function(require,module,exports){
var images = [
  {
    title: 'Image count',
    description: 'Shows total image count',
    fn: function(page) {
      return page.media.images.length;
    }
  },
  {
    title: 'Image Sources',
    description: 'Shows image sources',
    fn: function(page) {
      return page.media.images.map(function(i) {
        return i.src;
      }).join(', ');
    }
  },
  {
    title: 'Image Alternative Text',
    description: 'Shows image alternative text',
    fn: function(page) {
      return page.media.images.filter(function(i) {
        return i.alt;
      }).map(function(i) {
        return i.alt;
      }).join(', ');
    }
  }
];

for (var i in images) {
  images[i].group = 'Link';
  images[i].scope = 'page';
}

module.exports = images;
},{}],9:[function(require,module,exports){
var links = [
  {
    title: 'Link count',
    description: 'Shows the total link count',
    fn: function(page) {
      return page.links.all.length;
    }
  },
  {
    title: 'Link Refs',
    description: 'Shows the link references',
    fn: function(page) {
      return page.links.all.map(function(l) {
        return l.href;
      }).join(', ');
    }
  },
  {
    title: 'Link Texts',
    description: 'Shows the link text',
    fn: function(page) {
      return page.links.all.filter(function(l) {
        return l.text;
      }).map(function(l) {
        return l.text;
      }).join(', ');
    }
  },
  {
    title: 'Link Titles',
    description: 'Shows the link titles',
    fn: function(page) {
      return page.links.all.filter(function(l) {
        return l.title;
      }).map(function(l) {
        return l.text;
      }).join(', ');
    }
  }
];

for (var i in links) {
  links[i].group = 'Link';
  links[i].scope = 'page';
}

module.exports = links;
},{}],10:[function(require,module,exports){
var meta = [
  {
    title: 'Title',
    description: 'Page should have title tag',
    fn: function(page) {
      return page.meta.title;
    }
  },
  {
    title: 'Description',
    description: 'Page should have description',
    fn: function(page) {
      return page.meta.description;
    }
  },
  {
    title: 'Keywords',
    description: 'Page might have some keywords defined',
    fn: function(page) {
      if (!page.meta.keywords) {
        return '';
      }
      return page.meta.keywords.split(/\s*,\s*/).filter(function(e) { return e; }).join(', ');
    }
  },
  {
    title: 'Keyword Counts in Text',
    description: 'Single keyword counting in text',
    fn: function(page) {
      if (!page.meta.keywords) {
        return '';
      }
      var keywords = page.meta.keywords.split(/\s*,\s*/).filter(function(e) { return e; }),
          text = page.text.text,
          total = 0,
          result = [];

      for (var i = keywords.length - 1; i >= 0; i--) {
        var words = keywords[i].split(/\s+/);
        if (words.length > 1) {
          keywords = keywords.concat(words);
        }
      };
      // remove doublicates
      var last = '';
      keywords = keywords.sort(function(a, b) { return (b.length - a.length); }).filter(function(e) {
        var result = (e.toLowerCase() !== last.toLowerCase());
        last = e;
        return result;
      });

      for (var i in keywords) {
        var count = 0;
        text.replace(new RegExp(keywords[i], 'gi'), function() {
          count++;
          return '';
        });
        total += count;
        result.push('' + count + 'x ' + keywords[i]);
      }
      return ''+total+'x/'+keywords.length+': '+result.join(', ');
    }
  },
  {
    title: 'Keyword Counts in Headers',
    description: 'Single keyword counting in headers',
    fn: function(page) {
      if (!page.meta.keywords || !page.headers.all) {
        return '';
      }
      var keywords = page.meta.keywords.split(/\s*,\s*/).filter(function(e) { return e; }),
          headerTexts = page.headers.all.map(function(h) { return h.text; }),
          total = 0,
          result = [];

      for (var i in keywords) {
        var regExp = new RegExp(keywords[i], 'gi');
        var count = 0;
        for (var j in headerTexts) {
          headerTexts[j].replace(regExp, function() {
            count++;
            return '';
          });
        }
        total += count;
        result.push('' + count + 'x ' + keywords[i]);
      }
      return ''+total+'x/'+keywords.length+': '+result.join(', ');
    }
  },
  {
    title: 'Keyword Counts in Description',
    description: 'Single keyword counting in meta description',
    fn: function(page) {
      if (!page.meta.keywords || !page.meta.description) {
        return '';
      }
      var keywords = page.meta.keywords.split(/\s*,\s*/).filter(function(e) { return e; }),
          text = page.meta.description,
          total = 0,
          result = [];

      for (var i in keywords) {
        var count = 0;
        text.replace(new RegExp(keywords[i], 'gi'), function() {
          count++;
          return '';
        });
        total += count;
        result.push('' + count + 'x ' + keywords[i]);
      }
      return ''+total+'x/'+keywords.length+': '+result.join(', ');
    }
  },
  {
    title: 'Language',
    description: 'Page should have a language definition',
    fn: function(page) {
      var lang = [];
      if (page.html.lang) {
        lang.push(page.html.lang);
      }
      if (page.meta.lang) {
        lang.push(page.meta.lang);
      }
      return lang.join(', ');
    }
  }
];

for (var i in meta) {
  meta[i].group = 'Meta';
  meta[i].scope = 'page';
}

module.exports = meta;
},{}],"ratings":[function(require,module,exports){
module.exports=require('7Puv7F');
},{}],"7Puv7F":[function(require,module,exports){
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

ratings.addRatings(require('./ratings/keyword'));
ratings.addRatings(require('./ratings/meta'));
ratings.addRatings(require('./ratings/default'));
ratings.addRatings(require('./ratings/link'));

module.exports = ratings;
},{"./ratings/default":13,"./ratings/keyword":14,"./ratings/link":15,"./ratings/meta":16}],13:[function(require,module,exports){
var defaults = [
  {
    title: 'Title and H1 comparison',
    description: 'Title should be different to H1',
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
      return ratio;
    }
  },
  {
    title: 'Headers',
    description: 'Only one H1 per page and lower level should have higher level',
    group: 'Headers',
    rateFn: function(page) {
      var score = 1,
          minPerLevel = 4,
          lessCountPoints = 0.1,
          missmatchPoints = 0.3,
          missingH1Points = 0.5,
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
              score -= missmatchPoints;
            }
            levelCounts.push(0);
          }
        } else if (level < levelCounts.length) { // decrease level
          while (level < levelCounts.length) {
            if (levelCounts[levelCounts.length - 1] < minPerLevel) {
              suggestions.push('Header count of level ' + levelCounts.length + ' should be at least ' + minPerLevel + ' (Header: ' + headers[i].text + ')');
              score -= lessCountPoints;
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
            score -= missingH1Points;
          } else if (levelCounts.length > 1 && count < minPerLevel) {
            suggestions.push('Header count of level ' + levelCounts.length + ' is ' + count + ' but should be at least ' + minPerLevel);
            score -= lessCountPoints;
          }
          levelCounts.pop();
        }
      }
      return {score: Math.max(0, score), suggestions: suggestions};
    }
  },
  {
    title: 'Text Ratio',
    description: 'Text to Stite markup should be larger than 50%',
    weight: 0.5,
    rateFn: function(page) {
      var lower = 0.2,
          upper = 0.6,
          score = (page.text.textRatio - lower) * (upper - lower),
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
},{}],14:[function(require,module,exports){
var keywords = [
  {
    title: 'Keyword Count',
    description: 'At least 5 keywords',
    weight: 0.4,
    rateFn: function(page) {
      var shortKeyword = 0.05,
          longKeyword = 0.1,
          score = 1;

      if (!page.meta.keywords) {
        return {score: 0, value: 0, suggestions: ['Add at least 5 keywords via mata tag']};
      } else {
        var keywords = page.meta.keywords.split(/\s*,\s*/), suggestions = [], score = 5;
        for (var i in keywords) {
          if (keywords[i].length < 4) {
            suggestions.push('Keyword ' + keywords[i] + ' is too short (less than 4 chars)');
            score -= shortKeyword;
          } else if (keywords[i].length > 20) {
            suggestions.push('Keyword ' + keywords[i] + ' is too long (more than 20 chars)');
            score -= longKeyword;
          }
        }
        return {score: score, value: keywords.length, suggestions: suggestions};
      }
    }
  },
  {
    title: 'Keywords in Text',
    description: 'Text should contain the keywords',
    weight: 2,
    rateFn: function(page) {
      if (!page.meta.keywords) {
        return 0;
      } else {
        var score = 0,
            keywordMax = 5,
            allCount = 0,
            keywords = page.meta.keywords.toLowerCase().split(/\s*,\s*/).filter(function(e) { return e; }),
            text = page.text.text.toLowerCase(),
            suggestions = [];

        for (var i in keywords) {
          var count = 0;
          text.replace(new RegExp(keywords[i], 'gi'), function() {
            count++;
            allCount++;
            return '';
          });
          score += (Math.min(keywordMax, count) / (keywords.length * keywordMax));
        }
        if (score === 0) {
          suggestions.push("Your text does not cointain any keyword of: " + keywords.join(', '));
        } else if (score < 0.2) {
          suggestions.push("Please improve your keywords rate in your text");
        } else if (score < 0.4) {
          suggestions.push("You can improve your keywords rate in your text");
        }
        return {score: score, value: allCount, suggestions: suggestions};
      }
    }
  },
  {
    title: 'Keywords in Title',
    description: 'Title should contain three keywords',
    weight: 3,
    rateFn: function(page) {
      if (!page.meta.title || !page.meta.keywords) {
        return 0;
      } else {
        var score = 0,
            maxMatch = 3,
            count = 0,
            keywords = page.meta.keywords.toLowerCase().split(/\s*,\s*/).filter(function(e) { return e; }),
            text = page.meta.title,
            suggestions = [];

        for (var i in keywords) {
          text.replace(new RegExp(keywords[i], 'gi'), function() {
            count++;
            return '';
          });
        }
        score = Math.min(maxMatch, count) / maxMatch;
        if (!count) {
          suggestions.push('Add at least one keyword to your title of: ' + keywords.join(', '));
        }
        return {score: score, value: count, suggestions: suggestions};
      }
    }
  },
  {
    title: 'Keywords in Description',
    description: 'Description should contain four keywords',
    weight: 1.5,
    rateFn: function(page) {
      if (!page.meta.description || !page.meta.keywords) {
        return 0;
      } else {
        var score = 0,
            maxMatch = 3,
            count = 0,
            keywords = page.meta.keywords.toLowerCase().split(/\s*,\s*/).filter(function(e) { return e; }),
            text = page.meta.description,
            suggestions = [];

        for (var i in keywords) {
          text.replace(new RegExp(keywords[i], 'gi'), function() {
            count++;
            return '';
          });
        }
        score = Math.min(maxMatch, count) / maxMatch;
        if (!count || count < 2) {
          suggestions.push('Add at least two keyword to your title of: ' + keywords.join(', '));
        }
        return {score: score, value: count, suggestions: suggestions};
      }
    }
  },
  {
    title: 'Keywords in Headers',
    description: 'Headers should contain keywords',
    weight: 2,
    rateFn: function(page) {
      if (!page.headers.all.length || !page.meta.keywords) {
        return 0;
      } else {
        var score = 0,
            maxMatch = 10,
            count = 0,
            keywords = page.meta.keywords.toLowerCase().split(/\s*,\s*/).filter(function(e) { return e; }),
            headerText = page.headers.all.map(function(h) { return h.text }),
            suggestions = [];

        for (var i in keywords) {
          var regExp = new RegExp(keywords[i], 'gi');
          for (var j in headerText)
            headerText[j].replace(regExp, function() {
            count++;
            return '';
          });
        }
        score = Math.min(maxMatch, count) / maxMatch;
        if (!count) {
          suggestions.push('Your titles do not contain any keywords of: ' + keywords.join(', '));
        } else if (count < 0.3 * maxMatch) {
          suggestions.push('Your titles could contain more keywords of: ' + keywords.join(', '));
        }
        return {score: score, value: count, suggestions: suggestions};
      }
    }
  }
];

for (var i in keywords) {
  keywords[i].group = 'Keyword';
  keywords[i].scope = 'page';
}

module.exports = keywords;
},{}],15:[function(require,module,exports){
var urlUtils = require('./../urlUtils'),
    minExternalLinks = 3,
    minInternalLinks = 6,
    links;

links = [
  {
    title: 'External Link Count',
    description: 'Page should have at least ' + minExternalLinks + ' external links',
    weight: 0.3,
    rateFn: function(page) {
      var count = page.links.externalUrls.length * (1 / minExternalLinks), threshold = 0.6;
      if (count < threshold) {
        return {score: count, suggestions: ['You have only ' +  count + ' external links']};
      }
      return count;
    }
  },
  {
    title: 'Local Link Count',
    description: 'Page should have at least ' + minInternalLinks + ' local links',
    weight: 0.2,
    rateFn: function(page) {
      var count = page.links.localUrls.length * (1 / minInternalLinks), threshold = 0.6;
      if (count < threshold) {
        return {score: count, suggestions: ['You have only ' +  count + ' local links']};
      }
      return count;
    }
  },
  {
    title: 'Valid local links',
    description: 'Page should have valid local links',
    weight: 0.5,
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
      result = 1 - ((ratio * .75) + (Math.min(5, invalidCount) * 0.05));
      if (result < 0.6) {
        suggestions.push('You have ' + invalidCount + ' invalid linux of ' + links.length + ' local links');
      }
      return {score: result, value: ratio, suggestions: suggestions};
    }
  },
  {
    title: 'Valid References',
    description: 'Page should have valid cross references',
    weight: 1,
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
              suggestions.push('Reference ' + links[i].href + ' not found');
              invalidReferences++;
            }
          }
        }
      }
      return {score: 1 - 0.2 * invalidReferences, value: invalidReferences, suggestions: suggestions};
    }
  },
  {
    title: 'Duplicate Link text ratio',
    description: 'Link texts should be different',
    rateFn: function(page, site) {
      var linkTexts = [],
          tmp = '',
          duplicates = 0,
          ratio,
          suggestions = [];

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
      return {score: 1 - ratio, value: ratio, suggestions: suggestions};
    }
  }
];

// Set defaults
for (var i in links) {
  links[i].group = links[i].group || 'Links';
  links[i].scope = 'page';
}

module.exports = links;


},{"./../urlUtils":"gZF72L"}],16:[function(require,module,exports){
var meta = [
  {
    title: 'Site Language',
    description: 'Languge should be set in html or meta tag',
    weight: 0.2,
    rateFn: function(page) {
      if (page.html.lang && page.html.lang.length || page.meta.lang && page.meta.lang.length) {
        return 1;
      }
      return 0;
    }
  },
  {
    title: 'Meta description length',
    description: 'Description should be between 70 and 160 chars',
    weight: 1,
    rateFn: function(page) {
      var description = page.meta.description || '',
          score = 1,
          minLength = 70,
          maxLength = 160,
          charPoints = 0.05,
          suggestions = [];

      if (description.length < minLength) {
        score -= (minLength - description.length) *  charPoints;
      } else if (description.length > maxLength) {
        score -= (description.length - maxLength) *  charPoints;
      }
      if (score < .6) {
        suggestions.push('Improve your description length which is ' + description.length);
      }
      return {score: score, value: description.length, suggestions: suggestions};
    }
  },
  {
    title: 'Meta title length',
    description: 'Title should be between 10 and 70 chars',
    weight: 1,
    rateFn: function(page) {
      var title = page.meta.title || '',
          score = 1,
          minLength = 10,
          maxLength = 70,
          charPoints = 0.1,
          suggestions = [];
      if (title.length < minLength) {
        score -= (minLength - title.length) *  charPoints;
      } else if (title.length > maxLength) {
        score -= (title.length - maxLength) *  charPoints;
      }
      if (score < 0.7) {
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
},{}],"urlUtils":[function(require,module,exports){
module.exports=require('gZF72L');
},{}],"gZF72L":[function(require,module,exports){
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
},{"url":23}],19:[function(require,module,exports){
var global=typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {};/*! http://mths.be/punycode v1.2.3 by @mathias */
;(function(root) {

	/** Detect free variables */
	var freeExports = typeof exports == 'object' && exports;
	var freeModule = typeof module == 'object' && module &&
		module.exports == freeExports && module;
	var freeGlobal = typeof global == 'object' && global;
	if (freeGlobal.global === freeGlobal || freeGlobal.window === freeGlobal) {
		root = freeGlobal;
	}

	/**
	 * The `punycode` object.
	 * @name punycode
	 * @type Object
	 */
	var punycode,

	/** Highest positive signed 32-bit float value */
	maxInt = 2147483647, // aka. 0x7FFFFFFF or 2^31-1

	/** Bootstring parameters */
	base = 36,
	tMin = 1,
	tMax = 26,
	skew = 38,
	damp = 700,
	initialBias = 72,
	initialN = 128, // 0x80
	delimiter = '-', // '\x2D'

	/** Regular expressions */
	regexPunycode = /^xn--/,
	regexNonASCII = /[^ -~]/, // unprintable ASCII chars + non-ASCII chars
	regexSeparators = /\x2E|\u3002|\uFF0E|\uFF61/g, // RFC 3490 separators

	/** Error messages */
	errors = {
		'overflow': 'Overflow: input needs wider integers to process',
		'not-basic': 'Illegal input >= 0x80 (not a basic code point)',
		'invalid-input': 'Invalid input'
	},

	/** Convenience shortcuts */
	baseMinusTMin = base - tMin,
	floor = Math.floor,
	stringFromCharCode = String.fromCharCode,

	/** Temporary variable */
	key;

	/*--------------------------------------------------------------------------*/

	/**
	 * A generic error utility function.
	 * @private
	 * @param {String} type The error type.
	 * @returns {Error} Throws a `RangeError` with the applicable error message.
	 */
	function error(type) {
		throw RangeError(errors[type]);
	}

	/**
	 * A generic `Array#map` utility function.
	 * @private
	 * @param {Array} array The array to iterate over.
	 * @param {Function} callback The function that gets called for every array
	 * item.
	 * @returns {Array} A new array of values returned by the callback function.
	 */
	function map(array, fn) {
		var length = array.length;
		while (length--) {
			array[length] = fn(array[length]);
		}
		return array;
	}

	/**
	 * A simple `Array#map`-like wrapper to work with domain name strings.
	 * @private
	 * @param {String} domain The domain name.
	 * @param {Function} callback The function that gets called for every
	 * character.
	 * @returns {Array} A new string of characters returned by the callback
	 * function.
	 */
	function mapDomain(string, fn) {
		return map(string.split(regexSeparators), fn).join('.');
	}

	/**
	 * Creates an array containing the numeric code points of each Unicode
	 * character in the string. While JavaScript uses UCS-2 internally,
	 * this function will convert a pair of surrogate halves (each of which
	 * UCS-2 exposes as separate characters) into a single code point,
	 * matching UTF-16.
	 * @see `punycode.ucs2.encode`
	 * @see <http://mathiasbynens.be/notes/javascript-encoding>
	 * @memberOf punycode.ucs2
	 * @name decode
	 * @param {String} string The Unicode input string (UCS-2).
	 * @returns {Array} The new array of code points.
	 */
	function ucs2decode(string) {
		var output = [],
		    counter = 0,
		    length = string.length,
		    value,
		    extra;
		while (counter < length) {
			value = string.charCodeAt(counter++);
			if (value >= 0xD800 && value <= 0xDBFF && counter < length) {
				// high surrogate, and there is a next character
				extra = string.charCodeAt(counter++);
				if ((extra & 0xFC00) == 0xDC00) { // low surrogate
					output.push(((value & 0x3FF) << 10) + (extra & 0x3FF) + 0x10000);
				} else {
					// unmatched surrogate; only append this code unit, in case the next
					// code unit is the high surrogate of a surrogate pair
					output.push(value);
					counter--;
				}
			} else {
				output.push(value);
			}
		}
		return output;
	}

	/**
	 * Creates a string based on an array of numeric code points.
	 * @see `punycode.ucs2.decode`
	 * @memberOf punycode.ucs2
	 * @name encode
	 * @param {Array} codePoints The array of numeric code points.
	 * @returns {String} The new Unicode string (UCS-2).
	 */
	function ucs2encode(array) {
		return map(array, function(value) {
			var output = '';
			if (value > 0xFFFF) {
				value -= 0x10000;
				output += stringFromCharCode(value >>> 10 & 0x3FF | 0xD800);
				value = 0xDC00 | value & 0x3FF;
			}
			output += stringFromCharCode(value);
			return output;
		}).join('');
	}

	/**
	 * Converts a basic code point into a digit/integer.
	 * @see `digitToBasic()`
	 * @private
	 * @param {Number} codePoint The basic numeric code point value.
	 * @returns {Number} The numeric value of a basic code point (for use in
	 * representing integers) in the range `0` to `base - 1`, or `base` if
	 * the code point does not represent a value.
	 */
	function basicToDigit(codePoint) {
		if (codePoint - 48 < 10) {
			return codePoint - 22;
		}
		if (codePoint - 65 < 26) {
			return codePoint - 65;
		}
		if (codePoint - 97 < 26) {
			return codePoint - 97;
		}
		return base;
	}

	/**
	 * Converts a digit/integer into a basic code point.
	 * @see `basicToDigit()`
	 * @private
	 * @param {Number} digit The numeric value of a basic code point.
	 * @returns {Number} The basic code point whose value (when used for
	 * representing integers) is `digit`, which needs to be in the range
	 * `0` to `base - 1`. If `flag` is non-zero, the uppercase form is
	 * used; else, the lowercase form is used. The behavior is undefined
	 * if `flag` is non-zero and `digit` has no uppercase form.
	 */
	function digitToBasic(digit, flag) {
		//  0..25 map to ASCII a..z or A..Z
		// 26..35 map to ASCII 0..9
		return digit + 22 + 75 * (digit < 26) - ((flag != 0) << 5);
	}

	/**
	 * Bias adaptation function as per section 3.4 of RFC 3492.
	 * http://tools.ietf.org/html/rfc3492#section-3.4
	 * @private
	 */
	function adapt(delta, numPoints, firstTime) {
		var k = 0;
		delta = firstTime ? floor(delta / damp) : delta >> 1;
		delta += floor(delta / numPoints);
		for (/* no initialization */; delta > baseMinusTMin * tMax >> 1; k += base) {
			delta = floor(delta / baseMinusTMin);
		}
		return floor(k + (baseMinusTMin + 1) * delta / (delta + skew));
	}

	/**
	 * Converts a Punycode string of ASCII-only symbols to a string of Unicode
	 * symbols.
	 * @memberOf punycode
	 * @param {String} input The Punycode string of ASCII-only symbols.
	 * @returns {String} The resulting string of Unicode symbols.
	 */
	function decode(input) {
		// Don't use UCS-2
		var output = [],
		    inputLength = input.length,
		    out,
		    i = 0,
		    n = initialN,
		    bias = initialBias,
		    basic,
		    j,
		    index,
		    oldi,
		    w,
		    k,
		    digit,
		    t,
		    length,
		    /** Cached calculation results */
		    baseMinusT;

		// Handle the basic code points: let `basic` be the number of input code
		// points before the last delimiter, or `0` if there is none, then copy
		// the first basic code points to the output.

		basic = input.lastIndexOf(delimiter);
		if (basic < 0) {
			basic = 0;
		}

		for (j = 0; j < basic; ++j) {
			// if it's not a basic code point
			if (input.charCodeAt(j) >= 0x80) {
				error('not-basic');
			}
			output.push(input.charCodeAt(j));
		}

		// Main decoding loop: start just after the last delimiter if any basic code
		// points were copied; start at the beginning otherwise.

		for (index = basic > 0 ? basic + 1 : 0; index < inputLength; /* no final expression */) {

			// `index` is the index of the next character to be consumed.
			// Decode a generalized variable-length integer into `delta`,
			// which gets added to `i`. The overflow checking is easier
			// if we increase `i` as we go, then subtract off its starting
			// value at the end to obtain `delta`.
			for (oldi = i, w = 1, k = base; /* no condition */; k += base) {

				if (index >= inputLength) {
					error('invalid-input');
				}

				digit = basicToDigit(input.charCodeAt(index++));

				if (digit >= base || digit > floor((maxInt - i) / w)) {
					error('overflow');
				}

				i += digit * w;
				t = k <= bias ? tMin : (k >= bias + tMax ? tMax : k - bias);

				if (digit < t) {
					break;
				}

				baseMinusT = base - t;
				if (w > floor(maxInt / baseMinusT)) {
					error('overflow');
				}

				w *= baseMinusT;

			}

			out = output.length + 1;
			bias = adapt(i - oldi, out, oldi == 0);

			// `i` was supposed to wrap around from `out` to `0`,
			// incrementing `n` each time, so we'll fix that now:
			if (floor(i / out) > maxInt - n) {
				error('overflow');
			}

			n += floor(i / out);
			i %= out;

			// Insert `n` at position `i` of the output
			output.splice(i++, 0, n);

		}

		return ucs2encode(output);
	}

	/**
	 * Converts a string of Unicode symbols to a Punycode string of ASCII-only
	 * symbols.
	 * @memberOf punycode
	 * @param {String} input The string of Unicode symbols.
	 * @returns {String} The resulting Punycode string of ASCII-only symbols.
	 */
	function encode(input) {
		var n,
		    delta,
		    handledCPCount,
		    basicLength,
		    bias,
		    j,
		    m,
		    q,
		    k,
		    t,
		    currentValue,
		    output = [],
		    /** `inputLength` will hold the number of code points in `input`. */
		    inputLength,
		    /** Cached calculation results */
		    handledCPCountPlusOne,
		    baseMinusT,
		    qMinusT;

		// Convert the input in UCS-2 to Unicode
		input = ucs2decode(input);

		// Cache the length
		inputLength = input.length;

		// Initialize the state
		n = initialN;
		delta = 0;
		bias = initialBias;

		// Handle the basic code points
		for (j = 0; j < inputLength; ++j) {
			currentValue = input[j];
			if (currentValue < 0x80) {
				output.push(stringFromCharCode(currentValue));
			}
		}

		handledCPCount = basicLength = output.length;

		// `handledCPCount` is the number of code points that have been handled;
		// `basicLength` is the number of basic code points.

		// Finish the basic string - if it is not empty - with a delimiter
		if (basicLength) {
			output.push(delimiter);
		}

		// Main encoding loop:
		while (handledCPCount < inputLength) {

			// All non-basic code points < n have been handled already. Find the next
			// larger one:
			for (m = maxInt, j = 0; j < inputLength; ++j) {
				currentValue = input[j];
				if (currentValue >= n && currentValue < m) {
					m = currentValue;
				}
			}

			// Increase `delta` enough to advance the decoder's <n,i> state to <m,0>,
			// but guard against overflow
			handledCPCountPlusOne = handledCPCount + 1;
			if (m - n > floor((maxInt - delta) / handledCPCountPlusOne)) {
				error('overflow');
			}

			delta += (m - n) * handledCPCountPlusOne;
			n = m;

			for (j = 0; j < inputLength; ++j) {
				currentValue = input[j];

				if (currentValue < n && ++delta > maxInt) {
					error('overflow');
				}

				if (currentValue == n) {
					// Represent delta as a generalized variable-length integer
					for (q = delta, k = base; /* no condition */; k += base) {
						t = k <= bias ? tMin : (k >= bias + tMax ? tMax : k - bias);
						if (q < t) {
							break;
						}
						qMinusT = q - t;
						baseMinusT = base - t;
						output.push(
							stringFromCharCode(digitToBasic(t + qMinusT % baseMinusT, 0))
						);
						q = floor(qMinusT / baseMinusT);
					}

					output.push(stringFromCharCode(digitToBasic(q, 0)));
					bias = adapt(delta, handledCPCountPlusOne, handledCPCount == basicLength);
					delta = 0;
					++handledCPCount;
				}
			}

			++delta;
			++n;

		}
		return output.join('');
	}

	/**
	 * Converts a Punycode string representing a domain name to Unicode. Only the
	 * Punycoded parts of the domain name will be converted, i.e. it doesn't
	 * matter if you call it on a string that has already been converted to
	 * Unicode.
	 * @memberOf punycode
	 * @param {String} domain The Punycode domain name to convert to Unicode.
	 * @returns {String} The Unicode representation of the given Punycode
	 * string.
	 */
	function toUnicode(domain) {
		return mapDomain(domain, function(string) {
			return regexPunycode.test(string)
				? decode(string.slice(4).toLowerCase())
				: string;
		});
	}

	/**
	 * Converts a Unicode string representing a domain name to Punycode. Only the
	 * non-ASCII parts of the domain name will be converted, i.e. it doesn't
	 * matter if you call it with a domain that's already in ASCII.
	 * @memberOf punycode
	 * @param {String} domain The domain name to convert, as a Unicode string.
	 * @returns {String} The Punycode representation of the given domain name.
	 */
	function toASCII(domain) {
		return mapDomain(domain, function(string) {
			return regexNonASCII.test(string)
				? 'xn--' + encode(string)
				: string;
		});
	}

	/*--------------------------------------------------------------------------*/

	/** Define the public API */
	punycode = {
		/**
		 * A string representing the current Punycode.js version number.
		 * @memberOf punycode
		 * @type String
		 */
		'version': '1.2.3',
		/**
		 * An object of methods to convert from JavaScript's internal character
		 * representation (UCS-2) to Unicode code points, and back.
		 * @see <http://mathiasbynens.be/notes/javascript-encoding>
		 * @memberOf punycode
		 * @type Object
		 */
		'ucs2': {
			'decode': ucs2decode,
			'encode': ucs2encode
		},
		'decode': decode,
		'encode': encode,
		'toASCII': toASCII,
		'toUnicode': toUnicode
	};

	/** Expose `punycode` */
	// Some AMD build optimizers, like r.js, check for specific condition patterns
	// like the following:
	if (
		typeof define == 'function' &&
		typeof define.amd == 'object' &&
		define.amd
	) {
		define(function() {
			return punycode;
		});
	}	else if (freeExports && !freeExports.nodeType) {
		if (freeModule) { // in Node.js or RingoJS v0.8.0+
			freeModule.exports = punycode;
		} else { // in Narwhal or RingoJS v0.7.0-
			for (key in punycode) {
				punycode.hasOwnProperty(key) && (freeExports[key] = punycode[key]);
			}
		}
	} else { // in Rhino or a web browser
		root.punycode = punycode;
	}

}(this));

},{}],20:[function(require,module,exports){
// Copyright Joyent, Inc. and other Node contributors.
//
// Permission is hereby granted, free of charge, to any person obtaining a
// copy of this software and associated documentation files (the
// "Software"), to deal in the Software without restriction, including
// without limitation the rights to use, copy, modify, merge, publish,
// distribute, sublicense, and/or sell copies of the Software, and to permit
// persons to whom the Software is furnished to do so, subject to the
// following conditions:
//
// The above copyright notice and this permission notice shall be included
// in all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
// USE OR OTHER DEALINGS IN THE SOFTWARE.

'use strict';

// If obj.hasOwnProperty has been overridden, then calling
// obj.hasOwnProperty(prop) will break.
// See: https://github.com/joyent/node/issues/1707
function hasOwnProperty(obj, prop) {
  return Object.prototype.hasOwnProperty.call(obj, prop);
}

module.exports = function(qs, sep, eq, options) {
  sep = sep || '&';
  eq = eq || '=';
  var obj = {};

  if (typeof qs !== 'string' || qs.length === 0) {
    return obj;
  }

  var regexp = /\+/g;
  qs = qs.split(sep);

  var maxKeys = 1000;
  if (options && typeof options.maxKeys === 'number') {
    maxKeys = options.maxKeys;
  }

  var len = qs.length;
  // maxKeys <= 0 means that we should not limit keys count
  if (maxKeys > 0 && len > maxKeys) {
    len = maxKeys;
  }

  for (var i = 0; i < len; ++i) {
    var x = qs[i].replace(regexp, '%20'),
        idx = x.indexOf(eq),
        kstr, vstr, k, v;

    if (idx >= 0) {
      kstr = x.substr(0, idx);
      vstr = x.substr(idx + 1);
    } else {
      kstr = x;
      vstr = '';
    }

    k = decodeURIComponent(kstr);
    v = decodeURIComponent(vstr);

    if (!hasOwnProperty(obj, k)) {
      obj[k] = v;
    } else if (isArray(obj[k])) {
      obj[k].push(v);
    } else {
      obj[k] = [obj[k], v];
    }
  }

  return obj;
};

var isArray = Array.isArray || function (xs) {
  return Object.prototype.toString.call(xs) === '[object Array]';
};

},{}],21:[function(require,module,exports){
// Copyright Joyent, Inc. and other Node contributors.
//
// Permission is hereby granted, free of charge, to any person obtaining a
// copy of this software and associated documentation files (the
// "Software"), to deal in the Software without restriction, including
// without limitation the rights to use, copy, modify, merge, publish,
// distribute, sublicense, and/or sell copies of the Software, and to permit
// persons to whom the Software is furnished to do so, subject to the
// following conditions:
//
// The above copyright notice and this permission notice shall be included
// in all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
// USE OR OTHER DEALINGS IN THE SOFTWARE.

'use strict';

var stringifyPrimitive = function(v) {
  switch (typeof v) {
    case 'string':
      return v;

    case 'boolean':
      return v ? 'true' : 'false';

    case 'number':
      return isFinite(v) ? v : '';

    default:
      return '';
  }
};

module.exports = function(obj, sep, eq, name) {
  sep = sep || '&';
  eq = eq || '=';
  if (obj === null) {
    obj = undefined;
  }

  if (typeof obj === 'object') {
    return map(objectKeys(obj), function(k) {
      var ks = encodeURIComponent(stringifyPrimitive(k)) + eq;
      if (isArray(obj[k])) {
        return obj[k].map(function(v) {
          return ks + encodeURIComponent(stringifyPrimitive(v));
        }).join(sep);
      } else {
        return ks + encodeURIComponent(stringifyPrimitive(obj[k]));
      }
    }).join(sep);

  }

  if (!name) return '';
  return encodeURIComponent(stringifyPrimitive(name)) + eq +
         encodeURIComponent(stringifyPrimitive(obj));
};

var isArray = Array.isArray || function (xs) {
  return Object.prototype.toString.call(xs) === '[object Array]';
};

function map (xs, f) {
  if (xs.map) return xs.map(f);
  var res = [];
  for (var i = 0; i < xs.length; i++) {
    res.push(f(xs[i], i));
  }
  return res;
}

var objectKeys = Object.keys || function (obj) {
  var res = [];
  for (var key in obj) {
    if (Object.prototype.hasOwnProperty.call(obj, key)) res.push(key);
  }
  return res;
};

},{}],22:[function(require,module,exports){
'use strict';

exports.decode = exports.parse = require('./decode');
exports.encode = exports.stringify = require('./encode');

},{"./decode":20,"./encode":21}],23:[function(require,module,exports){
/*jshint strict:true node:true es5:true onevar:true laxcomma:true laxbreak:true eqeqeq:true immed:true latedef:true*/
(function () {
  "use strict";

// Copyright Joyent, Inc. and other Node contributors.
//
// Permission is hereby granted, free of charge, to any person obtaining a
// copy of this software and associated documentation files (the
// "Software"), to deal in the Software without restriction, including
// without limitation the rights to use, copy, modify, merge, publish,
// distribute, sublicense, and/or sell copies of the Software, and to permit
// persons to whom the Software is furnished to do so, subject to the
// following conditions:
//
// The above copyright notice and this permission notice shall be included
// in all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
// USE OR OTHER DEALINGS IN THE SOFTWARE.

var punycode = require('punycode');

exports.parse = urlParse;
exports.resolve = urlResolve;
exports.resolveObject = urlResolveObject;
exports.format = urlFormat;

// Reference: RFC 3986, RFC 1808, RFC 2396

// define these here so at least they only have to be
// compiled once on the first module load.
var protocolPattern = /^([a-z0-9.+-]+:)/i,
    portPattern = /:[0-9]*$/,

    // RFC 2396: characters reserved for delimiting URLs.
    // We actually just auto-escape these.
    delims = ['<', '>', '"', '`', ' ', '\r', '\n', '\t'],

    // RFC 2396: characters not allowed for various reasons.
    unwise = ['{', '}', '|', '\\', '^', '~', '`'].concat(delims),

    // Allowed by RFCs, but cause of XSS attacks.  Always escape these.
    autoEscape = ['\''].concat(delims),
    // Characters that are never ever allowed in a hostname.
    // Note that any invalid chars are also handled, but these
    // are the ones that are *expected* to be seen, so we fast-path
    // them.
    nonHostChars = ['%', '/', '?', ';', '#']
      .concat(unwise).concat(autoEscape),
    nonAuthChars = ['/', '@', '?', '#'].concat(delims),
    hostnameMaxLen = 255,
    hostnamePartPattern = /^[a-zA-Z0-9][a-z0-9A-Z_-]{0,62}$/,
    hostnamePartStart = /^([a-zA-Z0-9][a-z0-9A-Z_-]{0,62})(.*)$/,
    // protocols that can allow "unsafe" and "unwise" chars.
    unsafeProtocol = {
      'javascript': true,
      'javascript:': true
    },
    // protocols that never have a hostname.
    hostlessProtocol = {
      'javascript': true,
      'javascript:': true
    },
    // protocols that always have a path component.
    pathedProtocol = {
      'http': true,
      'https': true,
      'ftp': true,
      'gopher': true,
      'file': true,
      'http:': true,
      'ftp:': true,
      'gopher:': true,
      'file:': true
    },
    // protocols that always contain a // bit.
    slashedProtocol = {
      'http': true,
      'https': true,
      'ftp': true,
      'gopher': true,
      'file': true,
      'http:': true,
      'https:': true,
      'ftp:': true,
      'gopher:': true,
      'file:': true
    },
    querystring = require('querystring');

function urlParse(url, parseQueryString, slashesDenoteHost) {
  if (url && typeof(url) === 'object' && url.href) return url;

  if (typeof url !== 'string') {
    throw new TypeError("Parameter 'url' must be a string, not " + typeof url);
  }

  var out = {},
      rest = url;

  // trim before proceeding.
  // This is to support parse stuff like "  http://foo.com  \n"
  rest = rest.trim();

  var proto = protocolPattern.exec(rest);
  if (proto) {
    proto = proto[0];
    var lowerProto = proto.toLowerCase();
    out.protocol = lowerProto;
    rest = rest.substr(proto.length);
  }

  // figure out if it's got a host
  // user@server is *always* interpreted as a hostname, and url
  // resolution will treat //foo/bar as host=foo,path=bar because that's
  // how the browser resolves relative URLs.
  if (slashesDenoteHost || proto || rest.match(/^\/\/[^@\/]+@[^@\/]+/)) {
    var slashes = rest.substr(0, 2) === '//';
    if (slashes && !(proto && hostlessProtocol[proto])) {
      rest = rest.substr(2);
      out.slashes = true;
    }
  }

  if (!hostlessProtocol[proto] &&
      (slashes || (proto && !slashedProtocol[proto]))) {
    // there's a hostname.
    // the first instance of /, ?, ;, or # ends the host.
    // don't enforce full RFC correctness, just be unstupid about it.

    // If there is an @ in the hostname, then non-host chars *are* allowed
    // to the left of the first @ sign, unless some non-auth character
    // comes *before* the @-sign.
    // URLs are obnoxious.
    var atSign = rest.indexOf('@');
    if (atSign !== -1) {
      var auth = rest.slice(0, atSign);

      // there *may be* an auth
      var hasAuth = true;
      for (var i = 0, l = nonAuthChars.length; i < l; i++) {
        if (auth.indexOf(nonAuthChars[i]) !== -1) {
          // not a valid auth.  Something like http://foo.com/bar@baz/
          hasAuth = false;
          break;
        }
      }

      if (hasAuth) {
        // pluck off the auth portion.
        out.auth = decodeURIComponent(auth);
        rest = rest.substr(atSign + 1);
      }
    }

    var firstNonHost = -1;
    for (var i = 0, l = nonHostChars.length; i < l; i++) {
      var index = rest.indexOf(nonHostChars[i]);
      if (index !== -1 &&
          (firstNonHost < 0 || index < firstNonHost)) firstNonHost = index;
    }

    if (firstNonHost !== -1) {
      out.host = rest.substr(0, firstNonHost);
      rest = rest.substr(firstNonHost);
    } else {
      out.host = rest;
      rest = '';
    }

    // pull out port.
    var p = parseHost(out.host);
    var keys = Object.keys(p);
    for (var i = 0, l = keys.length; i < l; i++) {
      var key = keys[i];
      out[key] = p[key];
    }

    // we've indicated that there is a hostname,
    // so even if it's empty, it has to be present.
    out.hostname = out.hostname || '';

    // if hostname begins with [ and ends with ]
    // assume that it's an IPv6 address.
    var ipv6Hostname = out.hostname[0] === '[' &&
        out.hostname[out.hostname.length - 1] === ']';

    // validate a little.
    if (out.hostname.length > hostnameMaxLen) {
      out.hostname = '';
    } else if (!ipv6Hostname) {
      var hostparts = out.hostname.split(/\./);
      for (var i = 0, l = hostparts.length; i < l; i++) {
        var part = hostparts[i];
        if (!part) continue;
        if (!part.match(hostnamePartPattern)) {
          var newpart = '';
          for (var j = 0, k = part.length; j < k; j++) {
            if (part.charCodeAt(j) > 127) {
              // we replace non-ASCII char with a temporary placeholder
              // we need this to make sure size of hostname is not
              // broken by replacing non-ASCII by nothing
              newpart += 'x';
            } else {
              newpart += part[j];
            }
          }
          // we test again with ASCII char only
          if (!newpart.match(hostnamePartPattern)) {
            var validParts = hostparts.slice(0, i);
            var notHost = hostparts.slice(i + 1);
            var bit = part.match(hostnamePartStart);
            if (bit) {
              validParts.push(bit[1]);
              notHost.unshift(bit[2]);
            }
            if (notHost.length) {
              rest = '/' + notHost.join('.') + rest;
            }
            out.hostname = validParts.join('.');
            break;
          }
        }
      }
    }

    // hostnames are always lower case.
    out.hostname = out.hostname.toLowerCase();

    if (!ipv6Hostname) {
      // IDNA Support: Returns a puny coded representation of "domain".
      // It only converts the part of the domain name that
      // has non ASCII characters. I.e. it dosent matter if
      // you call it with a domain that already is in ASCII.
      var domainArray = out.hostname.split('.');
      var newOut = [];
      for (var i = 0; i < domainArray.length; ++i) {
        var s = domainArray[i];
        newOut.push(s.match(/[^A-Za-z0-9_-]/) ?
            'xn--' + punycode.encode(s) : s);
      }
      out.hostname = newOut.join('.');
    }

    out.host = (out.hostname || '') +
        ((out.port) ? ':' + out.port : '');
    out.href += out.host;

    // strip [ and ] from the hostname
    if (ipv6Hostname) {
      out.hostname = out.hostname.substr(1, out.hostname.length - 2);
      if (rest[0] !== '/') {
        rest = '/' + rest;
      }
    }
  }

  // now rest is set to the post-host stuff.
  // chop off any delim chars.
  if (!unsafeProtocol[lowerProto]) {

    // First, make 100% sure that any "autoEscape" chars get
    // escaped, even if encodeURIComponent doesn't think they
    // need to be.
    for (var i = 0, l = autoEscape.length; i < l; i++) {
      var ae = autoEscape[i];
      var esc = encodeURIComponent(ae);
      if (esc === ae) {
        esc = escape(ae);
      }
      rest = rest.split(ae).join(esc);
    }
  }


  // chop off from the tail first.
  var hash = rest.indexOf('#');
  if (hash !== -1) {
    // got a fragment string.
    out.hash = rest.substr(hash);
    rest = rest.slice(0, hash);
  }
  var qm = rest.indexOf('?');
  if (qm !== -1) {
    out.search = rest.substr(qm);
    out.query = rest.substr(qm + 1);
    if (parseQueryString) {
      out.query = querystring.parse(out.query);
    }
    rest = rest.slice(0, qm);
  } else if (parseQueryString) {
    // no query string, but parseQueryString still requested
    out.search = '';
    out.query = {};
  }
  if (rest) out.pathname = rest;
  if (slashedProtocol[proto] &&
      out.hostname && !out.pathname) {
    out.pathname = '/';
  }

  //to support http.request
  if (out.pathname || out.search) {
    out.path = (out.pathname ? out.pathname : '') +
               (out.search ? out.search : '');
  }

  // finally, reconstruct the href based on what has been validated.
  out.href = urlFormat(out);
  return out;
}

// format a parsed object into a url string
function urlFormat(obj) {
  // ensure it's an object, and not a string url.
  // If it's an obj, this is a no-op.
  // this way, you can call url_format() on strings
  // to clean up potentially wonky urls.
  if (typeof(obj) === 'string') obj = urlParse(obj);

  var auth = obj.auth || '';
  if (auth) {
    auth = encodeURIComponent(auth);
    auth = auth.replace(/%3A/i, ':');
    auth += '@';
  }

  var protocol = obj.protocol || '',
      pathname = obj.pathname || '',
      hash = obj.hash || '',
      host = false,
      query = '';

  if (obj.host !== undefined) {
    host = auth + obj.host;
  } else if (obj.hostname !== undefined) {
    host = auth + (obj.hostname.indexOf(':') === -1 ?
        obj.hostname :
        '[' + obj.hostname + ']');
    if (obj.port) {
      host += ':' + obj.port;
    }
  }

  if (obj.query && typeof obj.query === 'object' &&
      Object.keys(obj.query).length) {
    query = querystring.stringify(obj.query);
  }

  var search = obj.search || (query && ('?' + query)) || '';

  if (protocol && protocol.substr(-1) !== ':') protocol += ':';

  // only the slashedProtocols get the //.  Not mailto:, xmpp:, etc.
  // unless they had them to begin with.
  if (obj.slashes ||
      (!protocol || slashedProtocol[protocol]) && host !== false) {
    host = '//' + (host || '');
    if (pathname && pathname.charAt(0) !== '/') pathname = '/' + pathname;
  } else if (!host) {
    host = '';
  }

  if (hash && hash.charAt(0) !== '#') hash = '#' + hash;
  if (search && search.charAt(0) !== '?') search = '?' + search;

  return protocol + host + pathname + search + hash;
}

function urlResolve(source, relative) {
  return urlFormat(urlResolveObject(source, relative));
}

function urlResolveObject(source, relative) {
  if (!source) return relative;

  source = urlParse(urlFormat(source), false, true);
  relative = urlParse(urlFormat(relative), false, true);

  // hash is always overridden, no matter what.
  source.hash = relative.hash;

  if (relative.href === '') {
    source.href = urlFormat(source);
    return source;
  }

  // hrefs like //foo/bar always cut to the protocol.
  if (relative.slashes && !relative.protocol) {
    relative.protocol = source.protocol;
    //urlParse appends trailing / to urls like http://www.example.com
    if (slashedProtocol[relative.protocol] &&
        relative.hostname && !relative.pathname) {
      relative.path = relative.pathname = '/';
    }
    relative.href = urlFormat(relative);
    return relative;
  }

  if (relative.protocol && relative.protocol !== source.protocol) {
    // if it's a known url protocol, then changing
    // the protocol does weird things
    // first, if it's not file:, then we MUST have a host,
    // and if there was a path
    // to begin with, then we MUST have a path.
    // if it is file:, then the host is dropped,
    // because that's known to be hostless.
    // anything else is assumed to be absolute.
    if (!slashedProtocol[relative.protocol]) {
      relative.href = urlFormat(relative);
      return relative;
    }
    source.protocol = relative.protocol;
    if (!relative.host && !hostlessProtocol[relative.protocol]) {
      var relPath = (relative.pathname || '').split('/');
      while (relPath.length && !(relative.host = relPath.shift()));
      if (!relative.host) relative.host = '';
      if (!relative.hostname) relative.hostname = '';
      if (relPath[0] !== '') relPath.unshift('');
      if (relPath.length < 2) relPath.unshift('');
      relative.pathname = relPath.join('/');
    }
    source.pathname = relative.pathname;
    source.search = relative.search;
    source.query = relative.query;
    source.host = relative.host || '';
    source.auth = relative.auth;
    source.hostname = relative.hostname || relative.host;
    source.port = relative.port;
    //to support http.request
    if (source.pathname !== undefined || source.search !== undefined) {
      source.path = (source.pathname ? source.pathname : '') +
                    (source.search ? source.search : '');
    }
    source.slashes = source.slashes || relative.slashes;
    source.href = urlFormat(source);
    return source;
  }

  var isSourceAbs = (source.pathname && source.pathname.charAt(0) === '/'),
      isRelAbs = (
          relative.host !== undefined ||
          relative.pathname && relative.pathname.charAt(0) === '/'
      ),
      mustEndAbs = (isRelAbs || isSourceAbs ||
                    (source.host && relative.pathname)),
      removeAllDots = mustEndAbs,
      srcPath = source.pathname && source.pathname.split('/') || [],
      relPath = relative.pathname && relative.pathname.split('/') || [],
      psychotic = source.protocol &&
          !slashedProtocol[source.protocol];

  // if the url is a non-slashed url, then relative
  // links like ../.. should be able
  // to crawl up to the hostname, as well.  This is strange.
  // source.protocol has already been set by now.
  // Later on, put the first path part into the host field.
  if (psychotic) {

    delete source.hostname;
    delete source.port;
    if (source.host) {
      if (srcPath[0] === '') srcPath[0] = source.host;
      else srcPath.unshift(source.host);
    }
    delete source.host;
    if (relative.protocol) {
      delete relative.hostname;
      delete relative.port;
      if (relative.host) {
        if (relPath[0] === '') relPath[0] = relative.host;
        else relPath.unshift(relative.host);
      }
      delete relative.host;
    }
    mustEndAbs = mustEndAbs && (relPath[0] === '' || srcPath[0] === '');
  }

  if (isRelAbs) {
    // it's absolute.
    source.host = (relative.host || relative.host === '') ?
                      relative.host : source.host;
    source.hostname = (relative.hostname || relative.hostname === '') ?
                      relative.hostname : source.hostname;
    source.search = relative.search;
    source.query = relative.query;
    srcPath = relPath;
    // fall through to the dot-handling below.
  } else if (relPath.length) {
    // it's relative
    // throw away the existing file, and take the new path instead.
    if (!srcPath) srcPath = [];
    srcPath.pop();
    srcPath = srcPath.concat(relPath);
    source.search = relative.search;
    source.query = relative.query;
  } else if ('search' in relative) {
    // just pull out the search.
    // like href='?foo'.
    // Put this after the other two cases because it simplifies the booleans
    if (psychotic) {
      source.hostname = source.host = srcPath.shift();
      //occationaly the auth can get stuck only in host
      //this especialy happens in cases like
      //url.resolveObject('mailto:local1@domain1', 'local2@domain2')
      var authInHost = source.host && source.host.indexOf('@') > 0 ?
                       source.host.split('@') : false;
      if (authInHost) {
        source.auth = authInHost.shift();
        source.host = source.hostname = authInHost.shift();
      }
    }
    source.search = relative.search;
    source.query = relative.query;
    //to support http.request
    if (source.pathname !== undefined || source.search !== undefined) {
      source.path = (source.pathname ? source.pathname : '') +
                    (source.search ? source.search : '');
    }
    source.href = urlFormat(source);
    return source;
  }
  if (!srcPath.length) {
    // no path at all.  easy.
    // we've already handled the other stuff above.
    delete source.pathname;
    //to support http.request
    if (!source.search) {
      source.path = '/' + source.search;
    } else {
      delete source.path;
    }
    source.href = urlFormat(source);
    return source;
  }
  // if a url ENDs in . or .., then it must get a trailing slash.
  // however, if it ends in anything else non-slashy,
  // then it must NOT get a trailing slash.
  var last = srcPath.slice(-1)[0];
  var hasTrailingSlash = (
      (source.host || relative.host) && (last === '.' || last === '..') ||
      last === '');

  // strip single dots, resolve double dots to parent dir
  // if the path tries to go above the root, `up` ends up > 0
  var up = 0;
  for (var i = srcPath.length; i >= 0; i--) {
    last = srcPath[i];
    if (last == '.') {
      srcPath.splice(i, 1);
    } else if (last === '..') {
      srcPath.splice(i, 1);
      up++;
    } else if (up) {
      srcPath.splice(i, 1);
      up--;
    }
  }

  // if the path is allowed to go above the root, restore leading ..s
  if (!mustEndAbs && !removeAllDots) {
    for (; up--; up) {
      srcPath.unshift('..');
    }
  }

  if (mustEndAbs && srcPath[0] !== '' &&
      (!srcPath[0] || srcPath[0].charAt(0) !== '/')) {
    srcPath.unshift('');
  }

  if (hasTrailingSlash && (srcPath.join('/').substr(-1) !== '/')) {
    srcPath.push('');
  }

  var isAbsolute = srcPath[0] === '' ||
      (srcPath[0] && srcPath[0].charAt(0) === '/');

  // put the host back
  if (psychotic) {
    source.hostname = source.host = isAbsolute ? '' :
                                    srcPath.length ? srcPath.shift() : '';
    //occationaly the auth can get stuck only in host
    //this especialy happens in cases like
    //url.resolveObject('mailto:local1@domain1', 'local2@domain2')
    var authInHost = source.host && source.host.indexOf('@') > 0 ?
                     source.host.split('@') : false;
    if (authInHost) {
      source.auth = authInHost.shift();
      source.host = source.hostname = authInHost.shift();
    }
  }

  mustEndAbs = mustEndAbs || (source.host && srcPath.length);

  if (mustEndAbs && !isAbsolute) {
    srcPath.unshift('');
  }

  source.pathname = srcPath.join('/');
  //to support request.http
  if (source.pathname !== undefined || source.search !== undefined) {
    source.path = (source.pathname ? source.pathname : '') +
                  (source.search ? source.search : '');
  }
  source.auth = relative.auth || source.auth;
  source.slashes = source.slashes || relative.slashes;
  source.href = urlFormat(source);
  return source;
}

function parseHost(host) {
  var out = {};
  var port = portPattern.exec(host);
  if (port) {
    port = port[0];
    if (port !== ':') {
      out.port = port.substr(1);
    }
    host = host.substr(0, host.length - port.length);
  }
  if (host) out.hostname = host;
  return out;
}

}());

},{"punycode":19,"querystring":22}]},{},["7Puv7F","SkZC52","gZF72L","c1XhJL"])
;