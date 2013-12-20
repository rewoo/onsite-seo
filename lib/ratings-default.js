var defaults = [
  {
    title: 'Title and H1 comparison',
    description: 'Title should be different to H1',
    max: 10,
    group: 'Headers',
    rateFn: function(page) {
      var uniqueWords = 0, ratio,
          titleWords = page.meta.title.toLowerCase().split(/\s+/).sort(),
          h1Words = [], h1List = page.headers.all.filter(function(e) { return e.level === 'h1'; });

      if (h1List.length) {
        h1Words = h1List[0].text.toLowerCase().split(/\s+/).sort();
      }

      for (var i in titleWords) {
        if (h1Words.indexOf(titleWords[i]) < 0) {
          uniqueWords++;
        }
      }
      for (var i in h1Words) {
        if (titleWords.indexOf(h1Words[i]) < 0) {
          uniqueWords++;
        }
      }
      ratio = uniqueWords / (titleWords.length + h1Words.length);
      return ratio * 10;
    }
  },
  {
    title: 'Headers',
    description: 'Only one H1 per page and lower level should have higher level',
    group: 'Headers',
    max: 10,
    rateFn: function(page) {
      var score = 10,
          minPerLevel = 4,
          headers = page.headers.all,
          levelCounts = [],
          suggestions = [];

      for (var i in headers) {
        var level = parseInt(headers[i].level.replace(/\D+/, ''));
        if (level <= 0) {
          // Skip invalids level
          continue;
        }
        if (level > levelCounts.length) { // increase level
          while (level > levelCounts.length) {
            if (level > levelCounts.length + 1) {
              suggestions.push('Header level missmatch at level ' + (levelCounts.length + 1) + ' for Header ' + headers[i].level + ': ' + headers[i].text + '');
              score -= 3;
            }
            levelCounts.push(0);
          }
        } else if (level < levelCounts.length) { // decrease level
          while (level < levelCounts.length) {
            if (levelCounts[levelCounts.length - 1] < minPerLevel) {
              suggestions.push('Header count of level ' + levelCounts.length + ' should be at least ' + minPerLevel + ' (Header: ' + headers[i].text + ')');
              score--;
            }
            levelCounts.pop();
          }
        }
        levelCounts[levelCounts.length - 1]++;
      }
      if (!levelCounts.length) {
        // no headers found
        score = 0;
      } else {
        while (levelCounts.length > 0) {
          var count = levelCounts[levelCounts.length - 1];
          if (levelCounts.length === 1 && count !== 1) {
            suggestions.push('Only one H1 should exists. Found ' + levelCounts[0]);
            score -= 2;
          } else if (levelCounts.length > 1 && count < minPerLevel) {
            suggestions.push('Header count of level ' + levelCounts.length + ' is ' + count + ' but should be at least ' + minPerLevel);
            score--;
          }
          levelCounts.pop();
        }
      }
      return {score: score, suggestions: suggestions};
    }
  },
  {
    title: 'Text Ratio',
    description: 'Text to Stite markup should be larger than 50%',
    max: 10,
    rateFn: function(page) {
      var lower = 0.2,
          upper = 0.6,
          score = (page.text.textRatio - 0.2) * (10 / (upper - lower)),
          result = {score: score, value: page.text.textRatio, suggestions: []};
      if (result.score <= 5) {
        var perCent = Math.ceil(page.text.textRatio * 100);
        result.suggestions.push('Your text to html markup ratio is very low with ' + perCent + '%');
      }
      return result;
    }
  }];

// Set defaults
for (var i in defaults) {
  defaults[i].group = defaults[i].group || 'Text';
  defaults[i].scope = 'page';
}

module.exports = defaults;