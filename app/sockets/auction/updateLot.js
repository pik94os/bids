/**
 * Created by emmtech on 13.07.16.
 */

'use strict';

const Lot = require('../../models').Lot;

module.exports = function (socket, data) {
    Lot.findOne({
        where:{id: data.lotId}
    }).then((result)=> {
            result.isSold = data.isSold;
            result.isCl = data.isCl;
        return result.save().then((data)=> {
            socket.emit('lotUpdate', {
                err: 0,
                data: data
            });
                socket.to('auction:'+(+data.auctionId)).emit('isSoldAndIsClean', {
                lotId: data.lotId,
                isSold:data.isSold,
                isCl: data.isCl
            });

        }).catch((err)=> {
            socket.emit('lotUpdate', {
                err: 1,
                message: err.message
            });
        })
    }).catch((err)=> {
        socket.emit('lotUpdate', {
            err: 1,
            message: err.message
        });
    })
};