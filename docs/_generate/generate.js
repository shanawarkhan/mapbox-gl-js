// GL style reference generator

var fs = require('fs'),
    path = require('path'),
    documentation = require('documentation'),
    normalize = require('documentation/streams/normalize'),
    html = require('documentation/streams/html'),
    flatten = require('documentation/streams/flatten'),
    filterAccess = require('documentation/streams/filter_access'),
    hierarchy = require('documentation/streams/hierarchy'),
    through = require('through'),
    Handlebars = require('handlebars');

Handlebars.registerHelper('join', function(array, sep, options) {
    return array ? array.map(function(item) { return options.fn(item); }).join(sep) : '';
});

Handlebars.registerPartial('methods', fs.readFileSync(path.join(__dirname, './methods.html.hbs'), 'utf8'));
Handlebars.registerPartial('signature', fs.readFileSync(path.join(__dirname, './signature.html.hbs'), 'utf8'));

var template = Handlebars.compile(fs.readFileSync(path.join(__dirname, './index.html.hbs'), 'utf8'));

documentation(require('../../package.json').main)
    .pipe(normalize())
    .pipe(html())
    .pipe(flatten())
    .pipe(filterAccess())
    .pipe(hierarchy())
    .pipe(through(function (classes) {
        debugger;
        fs.writeFileSync(
            path.join(__dirname, '../_posts/3400-01-01-api.html'),
            template({classes: classes}));
    }));
