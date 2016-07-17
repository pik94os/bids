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
        descriptionPrev: data.descriptionPrev,
        description: data.description,
        estimateFrom: data.estimateFrom,
        estimateTo: data.estimateTo,
        sellingPrice: data.sellingPrice,
        year: data.year,
        isArchive: false,
        isSold: false,
        isCl: false,
        titlePicId: data.titlePicId,
        isPlayOut: false,
        auctionId: data.auctionId
    };

    Lot.findOne({where: {number: data.number}}).then(function (result) {
        if (result){
            socket.emit('lotCreated',
                {err: 0, lotExist: data.number}
            );
            // Lot.update(_lotData, {
            //     where: {number: data.number}
            // })
        } else {
            Lot.create(_lotData)
                .then(function (lot) {
                    console.log('>>>>>>>>>>>>>>>>>>');
                    console.log(lot);
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
        }
    });
};