var urlUtils = require('./urlUtils'),
    minExternalLinks = 3,
    minInternalLinks = 6,
    links;

links = [
  {
    title: 'External Link Count',
    description: 'Page should have at least ' + minExternalLinks + ' external links',
    max: minExternalLinks,
    rateFn: function(page) {
      var count = page.links.externalUrls.length, threshold = Math.ceil(minInternalLinks * 0.5);
      if (count < threshold) {
        return {score: count, suggestions: ['You have only ' +  count + ' external links']};
      }
      return count;
    }
  },
  {
    title: 'Local Link Count',
    description: 'Page should have at least ' + minInternalLinks + ' local links',
    max: minExternalLinks,
    rateFn: function(page) {
      var count = page.links.localUrls.length, threshold = Math.ceil(minInternalLinks * 0.5);
      if (count < threshold) {
        return {score: count, suggestions: ['You have only ' +  count + ' local links']};
      }
      return count;
    }
  },
  {
    title: 'Valid local links',
    description: 'Page should have valid local links',
    max: 20,
    rateFn: function(page, site) {
      var links = page.links.localUrls,
          invalidCount = 0,
          urls = site.urls,
          suggestions = [],
          ratio, result;

      for (var i in links) {
        var resolved = urlUtils.resolveUrl(page.url, links[i]);
        if (urls.indexOf(resolved) < 0) {
          suggestions.push('Found invalid link to ' + links[i] + ' (' + resolved + ')');
          invalidCount++;
        }
      }
      ratio = invalidCount / Math.max(1, links.length);

      // Count ratio by 3/4 and absolute count by 1/4 of maximum 20 points
      result = 20 - ((ratio * 15) + (Math.min(5, invalidCount)));
      if (result < 15) {
        suggestions.push('You have ' + invalidCount + ' invalid linux of ' + links.length + ' local links');
      }
      return {score: result, value: ratio, suggestions: suggestions};
    }
  },
  {
    title: 'Valid References',
    description: 'Page should have valid cross references',
    max: 5,
    rateFn: function(page, site) {
      var links,
          suggestions = [],
          invalidReferences = 0;

      links = page.links.all.filter(function(e) {
        return e.href.indexOf('#') > 0 && urlUtils.isLocalUrl(site.address, urlUtils.resolveUrl(page.url, e.href));
      });

      for (var i in links) {
        var refUrl = urlUtils.resolveUrl(page.url, links[i].href);
        var anchor = links[i].href.replace(/.*#/, '');
        for (var j in site.pages) {
          if (site.pages[j].url === refUrl) {
            if (site.pages[j].html.ids.indexOf(anchor) < 0) {
              suggestions.push('Reference ' + links[i].href + ' not found')
              invalidReferences++;
            }
          }
        }
      }
      return {score: 5 - invalidReferences, value: invalidReferences, suggestions: suggestions};
    }
  },
  {
    title: 'Duplicate Link text ratio',
    description: 'Link texts should be different',
    max: 5,
    rateFn: function(page, site) {
      var linkTexts = [],
          tmp = '',
          duplicates = 0,
          ratio,
          suggestions = [],
          score = 5;

      for (var i in page.links.all) {
        linkTexts.push(page.links.all[i].text);
      }
      linkTexts = linkTexts.sort();
      for (var i in linkTexts) {
        if (tmp === linkTexts[i]) {
          duplicates++;
        }
        tmp = linkTexts[i];
      }
      ratio = duplicates / linkTexts.length;
      if (ratio > .2) {
        suggestions.push('You have a link duplication text rate of ' + ratio.toFixed(2));
      }
      score -= ratio * 5;
      return {score: score, value: ratio, suggestions: suggestions};
    }
  }
];

// Set defaults
for (var i in links) {
  links[i].max = links[i].max || 10;
  links[i].group = links[i].group || 'Links';
  links[i].scope = 'page';
}

module.exports = links;

