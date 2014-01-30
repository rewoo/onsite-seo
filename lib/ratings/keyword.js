var keywords = [
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
    title: 'Keywords in Text',
    description: 'Text should contain the keywords',
    weight: 2,
    rateFn: function(page) {
      if (!page.meta.keywords) {
        return 0;
      } else {
        var score = 0,
            keywordMax = 5,
            allCount = 0,
            keywords = page.meta.keywords.toLowerCase().split(/\s*,\s*/).filter(function(e) { return e; }),
            text = page.text.text.toLowerCase(),
            suggestions = [];

        for (var i in keywords) {
          var count = 0;
          text.replace(new RegExp(keywords[i], 'gi'), function() {
            count++;
            allCount++;
            return '';
          });
          score += (Math.min(keywordMax, count) / (keywords.length * keywordMax));
        }
        if (score === 0) {
          suggestions.push("Your text does not cointain any keyword of: " + keywords.join(', '));
        } else if (score < 0.2) {
          suggestions.push("Please improve your keywords rate in your text");
        } else if (score < 0.4) {
          suggestions.push("You can improve your keywords rate in your text");
        }
        return {score: score, value: allCount, suggestions: suggestions};
      }
    }
  },
  {
    title: 'Keywords in Title',
    description: 'Title should contain three keywords',
    weight: 3,
    rateFn: function(page) {
      if (!page.meta.title || !page.meta.keywords) {
        return 0;
      } else {
        var score = 0,
            maxMatch = 3,
            count = 0,
            keywords = page.meta.keywords.toLowerCase().split(/\s*,\s*/).filter(function(e) { return e; }),
            title = page.meta.title,
            suggestions = [];

        for (var i in keywords) {
          title.replace(new RegExp(keywords[i], 'gi'), function() {
            count++;
            return '';
          });
        }
        score = Math.min(maxMatch, count) / maxMatch;
        if (!count) {
          suggestions.push('Add at least one keyword to your title of: ' + keywords.join(', '));
        }
        return {score: score, value: count, suggestions: suggestions};
      }
    }
  },
  {
    title: 'Keywords in Headers',
    description: 'Headers should contain keywords',
    weight: 2,
    rateFn: function(page) {
      if (!page.headers.all.length || !page.meta.keywords) {
        return 0;
      } else {
        var score = 0,
            maxMatch = 10,
            count = 0,
            keywords = page.meta.keywords.toLowerCase().split(/\s*,\s*/).filter(function(e) { return e; }),
            headerText = page.headers.all.map(function(h) { return h.text }),
            suggestions = [];

        for (var i in keywords) {
          var regExp = new RegExp(keywords[i], 'gi');
          for (var j in headerText)
            headerText[j].replace(regExp, function() {
            count++;
            return '';
          });
        }
        score = Math.min(maxMatch, count) / maxMatch;
        if (!count) {
          suggestions.push('Your titles do not contain any keywords of: ' + keywords.join(', '));
        } else if (count < 0.3 * maxMatch) {
          suggestions.push('Your titles could contain more keywords of: ' + keywords.join(', '));
        }
        return {score: score, value: count, suggestions: suggestions};
      }
    }
  }
];

for (var i in keywords) {
  keywords[i].group = 'Keyword';
  keywords[i].scope = 'page';
}

module.exports = keywords;