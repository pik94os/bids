/**
 * Created by Роман on 08.12.2014.
 */
define(['./module','io'], function (factory,io) {
    'use strict';
    factory.factory('ngSocket', function (socketFactory) {
        return socketFactory({
            ioSocket: io.connect(window.location.protocol+'//'+window.location.hostname+':'+window.location.port+'/',{query: {loc: window.location}})
        });
    });
});