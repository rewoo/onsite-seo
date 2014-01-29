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
      return page.meta.keywords;
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