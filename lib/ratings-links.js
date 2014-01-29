var urlUtils = require('./urlUtils'),
    minExternalLinks = 3,
    minInternalLinks = 6,
    links;

links = [
  {
    title: 'External Link Count',
    description: 'Page should have at least ' + minExternalLinks + ' external links',
    weight: 0.3,
    rateFn: function(page) {
      var count = page.links.externalUrls.length * (1 / minExternalLinks), threshold = 0.6;
      if (count < threshold) {
        return {score: count, suggestions: ['You have only ' +  count + ' external links']};
      }
      return count;
    }
  },
  {
    title: 'Local Link Count',
    description: 'Page should have at least ' + minInternalLinks + ' local links',
    weight: 0.2,
    rateFn: function(page) {
      var count = page.links.localUrls.length * (1 / minInternalLinks), threshold = 0.6;
      if (count < threshold) {
        return {score: count, suggestions: ['You have only ' +  count + ' local links']};
      }
      return count;
    }
  },
  {
    title: 'Valid local links',
    description: 'Page should have valid local links',
    weight: 0.5,
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
      result = 1 - ((ratio * .75) + (Math.min(5, invalidCount) * 0.05));
      if (result < 0.6) {
        suggestions.push('You have ' + invalidCount + ' invalid linux of ' + links.length + ' local links');
      }
      return {score: result, value: ratio, suggestions: suggestions};
    }
  },
  {
    title: 'Valid References',
    description: 'Page should have valid cross references',
    weight: 1,
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
              suggestions.push('Reference ' + links[i].href + ' not found');
              invalidReferences++;
            }
          }
        }
      }
      return {score: 1 - 0.2 * invalidReferences, value: invalidReferences, suggestions: suggestions};
    }
  },
  {
    title: 'Duplicate Link text ratio',
    description: 'Link texts should be different',
    rateFn: function(page, site) {
      var linkTexts = [],
          tmp = '',
          duplicates = 0,
          ratio,
          suggestions = [];

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
      return {score: 1 - ratio, value: ratio, suggestions: suggestions};
    }
  }
];

// Set defaults
for (var i in links) {
  links[i].group = links[i].group || 'Links';
  links[i].scope = 'page';
}

module.exports = links;

