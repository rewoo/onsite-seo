var lightdom = require('lightdom');

var text = [
  {
    title: 'Word Count',
    description: 'Number of single words',
    fn: function(page) {
      return page.text.text.split(/\s+/).length;
    }
  },
  {
    title: 'Paragraph Count',
    description: 'Number of paragraph',
    fn: function(page) {
      var count = 0;
      lightdom.walk(page.html.lightDOM, function(n) {
        if (n.type === 'e' && n.name === 'p') {
          count++;
        }
      });
      return count;
    }
  }
];

for (var i in text) {
  text[i].group = 'Text';
  text[i].scope = 'page';
}

module.exports = text;