var lightdom = require('../lightdom');

/**
 * Explode keywords by single words and append single words as keywords
 *
 * @param {Array} keywords Keyword array
 * @returns {Array}
 */
var explode = function(keywords) {
  for (var i = keywords.length - 1; i >= 0; i--) {
    var words = keywords[i].split(/\s+/);
    if (words.length > 1) {
      keywords = keywords.concat(words);
    }
  };
  return keywords;
};

/**
 * Unify words and order them by length. Longest first
 *
 * @param {Array} List of keywords
 * @result {Array} Ordered list
 */
var unify = function(words) {
  var last = '';
  return words.sort(function(a, b) { return (b.length - a.length); }).filter(function(e) {
    var result = (e.toLowerCase() !== last.toLowerCase());
    last = e;
    return result;
  });
};

var extract = function(keywords, text) {
  var result = {};

  keywords = unify(keywords);

  for (var i in keywords) {
    var keyword = keywords[i];
    result[keyword] = 0;
    text.replace(new RegExp(keyword, 'gi'), function() {
      result[keyword]++;
      return '';
    });
  }
  return result;
};

var stringify = function(result) {
  var total = 0, count = 0, parts = [];

  for (var keyword in result) {
    if (!result.hasOwnProperty(keyword)) {
      continue;
    }
    count++;
    total += result[keyword];
    parts.push('' + result[keyword] + 'x ' + keyword);
  }
  return '' + total + 'x/' + count + ': ' + parts.join(', ');
};

var keywords = [
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
    title: 'Keywords in Description',
    description: 'Single keyword counting in meta description',
    fn: function(page) {
      if (!page.meta.keywords || !page.meta.description) {
        return '';
      }
      var keywords = page.meta.keywords.split(/\s*,\s*/).filter(function(e) { return e; }),
          text = page.meta.description;

      return stringify(extract(keywords, text));
    }
  },
  {
    title: 'Keywords in Headers',
    description: 'Single keyword counting in headers',
    fn: function(page) {
      if (!page.meta.keywords || !page.headers.all) {
        return '';
      }
      var keywords = page.meta.keywords.split(/\s*,\s*/).filter(function(e) { return e; }),
          text = page.headers.all.map(function(h) { return h.text; }).join(' ');

      return stringify(extract(keywords, text));
    }
  },
  {
    title: 'Keywords in Link Text',
    description: 'Counts keywords in link texts',
    weight: 0.5,
    fn: function(page) {
      if (!page.meta.keywords || !page.links.all) {
        return '';
      }
      var keywords = page.meta.keywords.split(/\s*,\s*/).filter(function(e) { return e; }),
          text = page.links.all.map(function(h) { return h.text; }).join(' ');

      return stringify(extract(keywords, text));
    }
  },
  {
    title: 'Keywords in Text',
    description: 'Single keyword counting in text',
    fn: function(page) {
      if (!page.meta.keywords) {
        return '';
      }
      var keywords = page.meta.keywords.split(/\s*,\s*/).filter(function(e) { return e; }),
          texts = [],
          excludeNodeNames = 'h1,h2,h3,h4,h5,h6,a,i,em,strong,b'.split(',');

      // Exclude headers and links
      lightdom.walk(page.html.lightDOM, function(n) {
        if (n.type === 't') {
          texts.push(n.data);
        }
        return n.type !== 'e' || excludeNodeNames.indexOf(n.name) < 0;
      });

      return stringify(extract(explode(keywords), texts.join(' ')));
    }
  },
  {
    title: 'Keywords in emphasis Text',
    description: 'Single keyword counting in text',
    weight: 0.2,
    fn: function(page) {
      if (!page.meta.keywords) {
        return '';
      }
      var keywords = page.meta.keywords.split(/\s*,\s*/).filter(function(e) { return e; }),
          text = page.text.strong.concat(page.text.emphasis).join(' ');

      return stringify(extract(explode(keywords), text));
    }
  },
  {
    title: 'Keyword Density',
    description: 'Keyword to words ratio',
    weight: 0.2,
    fn: function(page) {
      if (!page.meta.keywords) {
        return 0;
      }
      var keywords = page.meta.keywords.split(/\s*,\s*/).filter(function(e) { return e; }),
          text = page.text.text,
          keywordResult = extract(keywords, text),
          count = 0;

      for (var keyword in keywordResult) {
        if (!keywordResult.hasOwnProperty(keyword)) {
          continue;
        }
        count += keywordResult[keyword];
      }

      return (count / text.split(/\s+/).length).toFixed(4);
    }
  }
];

for (var i in keywords) {
  keywords[i].group = 'Keyword';
  keywords[i].scope = 'page';
}

module.exports = keywords;