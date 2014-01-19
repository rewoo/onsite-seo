var meta = [
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
    title: 'Keywords in text',
    description: 'Text should contain the keywords',
    weight: 1,
    rateFn: function(page) {
      if (!page.meta.keywords) {
        return 0;
      } else {
        var score = 0,
            count = 0,
            keywords = page.meta.keywords.split(/\s*,\s*/),
            text = page.text.text.toLowerCase();

        for (var i in keywords) {
          text.replace(new RegExp(keywords[i], 'gi'), function() {
            count++;
            return '';
          });
        }
        score = count / (keywords.length * 2);
        return {score: score, value: count};
      }
    }
  },
  {
    title: 'Site Language',
    description: 'Languge should be set in html or meta tag',
    weight: 1.5,
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
    weight: 3,
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
    weight: 1.5,
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