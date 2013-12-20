var inspector = {};

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
  var trim = function(s) {
    if (s) {
      return s.replace(/^\s+/, '').replace(/\s+$/, '');
    }
    return s;
  };

  result.hasJQuery = (typeof($) !== 'undefined');
  if (result.hasJQuery) {
    result.html.lang = trim($("html[lang]").attr('lang'));
    result.html.ids = $.map($("[id]"), function(e) { return $(e).attr("id"); });

    result.meta.lang = trim($("meta[http-equiv]").attr('content'));
    result.meta.title = trim($("title").text());
    result.meta.description = trim($("meta[name=description]").attr('content'));
    result.meta.keywords = trim($("meta[name=keywords]").attr('content'));

    result.links.all = $.map($("a[href]"), function(e) { return {href: $(e).attr("href"), title: $(e).attr('title'), text: trim($(e).text())}; });

    var headers = [];
    $('*').each(function() {
      var name = $(this).prop('nodeName');
      if (name.match(/^H[1-9]$/)) {
        name = name.toLowerCase();
        headers.push({level: name, text: trim($(this).text())});
      }
    });

    result.headers.all = headers;

    result.text.text = $("body").text().replace(/\s+/g, ' ').replace(/(^\s+|\s+$)/g, '');
    result.text.textSize = result.text.text.length;
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