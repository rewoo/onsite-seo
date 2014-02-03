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
  }
];

for (var i in keywords) {
  keywords[i].group = 'Meta';
  keywords[i].scope = 'page';
}

module.exports = keywords;