# Offline OnSite SEO Tool

Evaluate your site offline for Search Engine Optimazations - for all your pages.

This tool will crawl your page for local links and will evaluate some SEO criterias
on all your pages to improve your SEO value like meta information, header order,
links or texts.

Visit the [demo page](http://rewoo.github.io/onsite-seo).

## Usage

First crawl your page via [phantomjs](http://phantomjs.org) and view your results
with the build in webserver:

    $ phantomjs seo.js <your page url> -n
    $ grunt server

Open your browser at `http://localhost:3000`. Get more help with `$ phantomjs seo.js`

### Offline Report

    $ phantomjs seo.js <your page url>

Now view the generated report of `report.html`.

### Options

`-m`, `--max-pages` n: Set the number of maximum pages. Crawl all when set to 0. Default is 0.

`-d`, `--max-depth` n: Maximum crawl depth. Default is 3.

`-r`, `--report` name: Offline report filename. Default is `report.html`.

`-n`, `--data-only`: Crawl only data to `seo-data.json`.

## Installation

Clone this project from github. Than

    $ npm install -g phantomjs
    $ npm update

## Extend

The process has two steps. First `lib/crawler.js` crawls the webpage, inject jQuery
to the current page and extracts some key properties via `lib/inspector.js`.

Than for offline report the result evalutated in `lib/report.js` by calling rating
functions of `lib/ratings.js`.

Or for the online SPA report the result is stored in `seo-data.json` and parsted in
the angular `app`.

Have a look to the ratings functions in `lib/ratings-*.js`. These functions rate
page properties and return a score. If you need to extract more data from your
page, please have a look to `lib/inspector.js`.

Keep in mind that the offline reporting and online version share some code:
`lib/ratings*.js` and `lib/urlUtils.js`. The ratings and urlUtils are node modules
which are used in the SPA via [browserify](http://browserify.org/). The
`Gruntfile.js` bundles `lib/ratings*.js` and `lib/urlUtils.js` to `app/js/bundle.js`
and copies `seo-data.json`.

### Ratings

A rating object has at least a `title` and a `rateFn` rating function. `description`,
`max`, and `group` are optional, but are set within `ratings.addRating()`.
`max` is the score maximum of the rating fuction, by default 10. The rating
function is called with the page and the site:

    var result = rating.rateFn(page, site)

The result of `rateFn` is a score number or an object with at least `score` and a list
of `suggestions`. The `value` is optional. The result is proxied in
`ratings.proxyRateFn()` and the score is limited between 0 and `max` automatically.

## Motivation

At the company's page update [rewoo.de](http://rewoo.de) we did not found a
simple and free offline tool, to evaluate all your pages with some static SEO rules.
There are plenty online offers which evaluates only one single page. To check all
your pages it is a pain. Questions where unanswered like

* Has every page only one H1 header?
* Does the text contains all given keywords?
* Are all links valid?
* Have all images an alt attribute?

This tool can answer these questions for all your pages on your site offline. And
it is free!

## Limitations

This tool was written within a few days to check some static SEO values. It does
not include all known rules (if anyone knows them anyway) and does not include
off site evaluation like backlinks, social media, trust, authority, page rank, etc.

## License

MIT, see LICENSE file.

## FAQ

### How does it work

First, your page is crawled and each page is insprected with some major properties
like meta information, headers, links, resources, etc. In a second step these
collected data are scored through different rating functions and summarized.

All that stuff is done with javascript, phantomjs, node, and [angularjs](http://angularjs.org).

### Why javascript?

The major language of the web is javascript. Deal with it. And [node](http://nodejs.org)
is an awesome project.

### Why phantomjs?

[phantomjs](http://phantomjs.org) is a great headless browser where you can check
operate directly on the page with javascript. Like evaluating only visible elements.
OK. Yes. I know. This is not used yet. But you can!

### Why are there two steps of crawling and displaying the results?

Phantomjs is not nodejs. There share some functionality but they are not the same.
So we need these two steps.

### The single scores of my page are arbitrary

Yes. They are. The should only give you some hint for your page. Most scores are
from 0 to 10. If you know better values, please file a github pull request.

### This tool does not show my backlinks or page rank

Please see limitations.

### My rule is not implemented

Please implement it and send a github pull request.