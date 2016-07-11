/**
 * Created by piligrim on 06.07.16.
 */
'use strict';
const Lot = require('../../models/').Lot;

module.exports = function(socket, data) {
    if (!data.lotId) {
        socket.emit('lotSelected',
            {err: 1, message: 'Undefined lot identifier'}
        );
        return
    }

    Lot.findById(data.lotId)
        .then(function(lot) {
            socket.emit('lotSelected', {
                'err': 0,
                lot: lot
            });
        }).catch(function (err) {
            socket.emit('lotSelected',
            {err: 1, message: err.message}
        );
    })
};