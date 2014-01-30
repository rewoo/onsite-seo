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