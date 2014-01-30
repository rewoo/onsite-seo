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