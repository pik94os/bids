/**
 * Created by pik on 29.08.16.
 */
'use strict';

const Lot = require('../../models').Lot;

module.exports = function (socket, data) {
    if (!data.id) {
        socket.emit('lotEdited', {
            err: 1,
            message: 'Undefined lot identifier'
        });
        return
    }
    Lot.findById(data.id).then((lot)=> {
        lot.number = data.number;
        lot.descriptionPrev = data.descriptionPrev;
        lot.estimateFrom = data.estimateFrom;
        lot.estimateTo = data.estimateTo;
        lot.year = data.year;
        lot.save();
    }).catch((err)=> {
        socket.emit('lotEdited', {
            err: 1,
            message: err.message
        });
    });


};