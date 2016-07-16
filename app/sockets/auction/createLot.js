/**
 * Created by piligrim on 06.07.16.
 */
'use strict';
var Lot = require('../../models/').Lot;


module.exports = function(socket, data) {
   if (!data.number) {
        socket.emit('lotCreated',
            {err: 1, message: 'Undefined lot number'}
        );
        return
    }
    let _lotData = {
        number: data.number,
        description: data.description,
        estimateFrom: data.estimateFrom,
        estimateTo: data.estimateTo,
        sellingPrice: data.sellingPrice,
        auctionId: data.auctionId,
        year: data.year,
        titlePicId: data.titlePicId
    };

    Lot.create(_lotData)
        .then(function (lot) {
            socket.emit('lotCreated', {
                'err': 0,
                newLot: {
                    lot : lot
                }
            });
        }).catch(function (err) {
            socket.emit('lotCreated',
                {err: 1, message: err.message, data:_lotData}
            );
        });
};