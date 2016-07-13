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
            socket.emit('auctionState', {
                lotId: data.lotId,
                isSold:data.isSold,
                isCl: data.isCl
            });
            return Lot.findOne({
                where: {
                    isSold: false,
                    isCl: false
                },
                order: [['id', 'ASC']]
            }).then((lot)=>{
                console.log(lot);
                socket.to('auction:'+(+data.auctionId)).emit('auctionState', {
                    lotId: lot.id,
                    isSold: data.isSold,
                    isCl: data.isCl
                });
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