# Offline OnSite SEO Tool

Evaluate your site offline for Search Engine Optimazations - for all your pages.

This tool will crawl your page for local links and will evaluate some SEO criterias
on all your pages to improve your SEO value like meta information, header order,
links or texts.

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

All that stuff is done with javascript, phantomjs, node, and angularjs.

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

Yes. They are. The should only give you some hint for your page. Most scores go
from 0 to 10. If you know better values, please file a github pull request.

### My rule is not implemented

Please implement it and send a github pull request