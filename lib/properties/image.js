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