/**
 * Created by Роман on 08.12.2014.
 */
define(['./module','io'], function (factory,io) {
    'use strict';
    factory.factory('ngSocket', function (socketFactory) {
        var myIoSocket = io.connect('http://'+window.location.hostname+':'+window.location.port+'/');
        return socketFactory({
            ioSocket: myIoSocket
        });
    });
});