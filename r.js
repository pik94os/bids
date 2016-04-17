/**
 * Created by pik on 14.03.16.
 */
'use strict';

var es        = require('event-stream');
var fs        = require('fs');
var path      = require('path');
var requirejs = require('requirejs');

//node r.js -o baseUrl=. paths.jquery=some/other/jquery name=main out=main-built.js

module.exports = function (options) {
    return es.mapSync(function (file, cb) {
        var name = path.basename(file.path).replace(path.extname(file.path), '');
        var outPath = path.join((options.outPath || options.baseUrl), name + '.js');
        console.log("node r.js -o baseUrl=" + options.baseUrl + " name=" + name + " out=" + outPath);
        requirejs.optimize({name:name, baseUrl:options.baseUrl, out:outPath, paths:options.paths, shim:options.shim, optimize:'none'}, function(err) {
            console.log("optimized");
        });
    });
};