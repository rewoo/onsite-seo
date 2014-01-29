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
      return page.meta.keywords.split(/\s*,\s*/).filter(function(e) { return e; }).join(', ');
    }
  },
  {
    title: 'Keyword Counts',
    description: 'Single keyword counting',
    fn: function(page) {
      if (!page.meta.keywords) {
        return '';
      }
      var keywords = page.meta.keywords.split(/\s*,\s*/).filter(function(e) { return e; }),
          text = page.text.text,
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
        result.push('' + count + 'x ' + keywords[i]);
      }
      return result.join(', ');
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