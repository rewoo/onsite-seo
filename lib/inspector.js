var lightdom = require('lightdom'),
  inspector = {};

var trim = function(s) {
  if (s) {
    return s.replace(/^\s+/, '').replace(/\s+$/, '');
  }
  return s;
};

var getHeaders = function(e) {
  var headers = [];
  var treeWalker = document.createTreeWalker(e, NodeFilter.SHOW_ELEMENT, {
    acceptNode: function(node) {
      if (node.nodeName.match(/h[1-9]/i)) {
        return NodeFilter.FILTER_ACCEPT;
      }
      return NodeFilter.FILTER_SKIP;
    }
  }, false);

  while (treeWalker.nextNode()) {
    var node = treeWalker.currentNode;
    headers.push({level: node.nodeName.toLowerCase(), text: trim($(node).text())});
  }
  return headers;
};

/**
 * Inspect a single page. The inspection must be within a single function.
 *
 * The function is executed in a sandbox and other functions can't be accessed.
 * See http://phantomjs.org/api/webpage/method/evaluate.html for mor details.
 *
 * @returns {object} Page result object
 */
inspector.inspect = function() {
  var result = {
    html: {},
    meta: {},
    links: {},
    headers: {},
    text: {},
    resources: {},
    media: {}
  };

  result.hasJQuery = (typeof($) !== 'undefined');
  if (result.hasJQuery) {
    result.html.lang = trim($("html[lang]").attr('lang'));
    result.html.ids = $.map($("[id]"), function(e) { return $(e).attr("id"); });
    result.html.lightDOM = lightdom.build(document.body);

    result.meta.lang = trim($('meta[http-equiv=content-language]').attr('content'));
    result.meta.title = trim($("title").text());
    result.meta.description = trim($('meta[name=description]').attr('content'));
    result.meta.keywords = (''+trim($('meta[name=keywords]').attr('content'))).split(/\s*,\s*/).filter(function(e) { return e; }).join(', ');
    result.meta.author = trim($('meta[name=author]').attr('content'));

    // meta: open-graph
    result.meta.ograph = {
      app: trim($('meta[property="fb:app_id"]').attr('content')),
      title: trim($('meta[property="og:title"]').attr('content')),
      type: trim($('meta[property="og:type"]').attr('content')),
      url: trim($('meta[property="og:url"]').attr('content')),
      image: trim($('meta[property="og:image"]').attr('content')),
      description: trim($('meta[property="og:description"]').attr('content'))
    };

    // meta: twitter
    result.meta.twitter = {
      site: trim($('meta[twitter="site"]').attr('content')),
      creator: trim($('meta[twitter="creator"]').attr('content')),
      card: trim($('meta[twitter="card"]').attr('content')),
      url: trim($('meta[twitter="url"]').attr('content')),
      title: trim($('meta[twitter="title"]').attr('content')),
      description: trim($('meta[twitter="description"]').attr('content')),
      image: trim($('meta[twitter="image"]').attr('content'))
    };

    // meta: windows
    result.meta.windows = {
      application: trim($('meta[name="application-name"]').attr('content')),
      msTileColor: trim($('meta[name="msapplication-TileColor"]').attr('content')),
      msTileImage: trim($('meta[name="msapplication-TileImage"]').attr('content')),
      msSquare70: trim($('meta[name="msapplication-square70x70logo"]').attr('content')),
      msSquare150: trim($('meta[name="msapplication-square150x150logo"]').attr('content')),
      msSquare310: trim($('meta[name="msapplication-square310x310logo"]').attr('content')),
      msWide310: trim($('meta[name="msapplication-wide310x150logo"]').attr('content'))

    };

    result.links.all = $.map($("a[href]"), function(e) { return {href: $(e).attr("href"), title: $(e).attr('title'), text: trim($(e).text())}; });

    result.headers.all = getHeaders(document.body);

    result.text.text = lightdom.text(result.html.lightDOM).replace(/\s{2,}/g, ' ').replace(/(^\s+|\s+$)/g, '');
    result.text.textSize = result.text.text.length;
    result.text.strong = $.map($("b"), function(e) { return $(e).text(); }).concat($.map($("strong"), function(e) { return $(e).text(); }));
    result.text.emphasis = $.map($("i"), function(e) { return $(e).text(); }).concat($.map($("em"), function(e) { return $(e).text(); }));
    result.text.htmlSize = $("html").html().replace(/\s+/g, ' ').length;
    result.text.textRatio = result.text.textSize / result.text.htmlSize;

    result.resources.externalScripts = $.map($("script[src]"), function(e) { return $(e).attr('src') ? false : $(e).attr('src'); });
    result.resources.inlineStyles = $("style").length;
    result.resources.styles = $.map($("link[rel=stylesheet]"), function(e) { return $(e).attr("href"); });

    result.media.images = $.map($("img[src]"), function(e) { return {src: $(e).attr("src"), alt: $(e).attr('alt'), width: $(e).attr('width'), height: $(e).attr('height')}; });
  }
  return result;
};

module.exports = inspector;