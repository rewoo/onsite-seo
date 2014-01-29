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