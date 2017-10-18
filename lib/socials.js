/**
 * Created by daniel.joppi on 7/4/15.
 */
var socials = {};

socials.getPageSocial = function(page) {
    var ograph = page.meta.ograph || {},
        twitter = page.meta.twitter || {},
        windows = page.meta.windows || {};
    var result = [
        {title: 'Facebook: App Id', value: ograph.app || ''},
        {title: 'Facebook: Title', value: ograph.title || ''},
        {title: 'Facebook: Type', value: ograph.type || ''},
        {title: 'Facebook: URL', value: ograph.url || ''},
        {title: 'Facebook: Image', value: ograph.image || ''},
        {title: 'Facebook: Description', value: ograph.description || ''},
        {title: 'Twitter: Type', value: twitter.card || ''},
        {title: 'Twitter: Site', value: twitter.site || ''},
        {title: 'Twitter: Creator', value: twitter.creator || ''},
        {title: 'Twitter: Title', value: twitter.title || ''},
        {title: 'Twitter: Description', value: twitter.description || ''},
        {title: 'Twitter: Image', value: twitter.image || ''},
        {title: 'Windows: App Name', value: windows.application || ''},
        {title: 'Windows: Tile Color', value: windows.msTileColor || ''},
        {title: 'Windows: Tile Image', value: windows.msTileImage || ''},
        {title: 'Windows: Square 70 Logo', value: windows.msSquare70 || ''},
        {title: 'Windows: Square 150 Logo', value: windows.msSquare150 || ''},
        {title: 'Windows: Square 310 Logo', value: windows.msSquare310 || ''},
        {title: 'Windows: Wide 310x150 Logo', value: windows.msWide310 || ''}
    ];
    return result;
};

module.exports = socials;