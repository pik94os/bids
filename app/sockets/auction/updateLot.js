/**
 * Created by emmtech on 13.07.16.
 */

'use strict';

const Lot = require('../../models').Lot;
const LotPicture = require('../../models').LotPicture;
module.exports = function (socket, data) {
    Lot.findOne({
        where:{id: data.lotId}
    }).then((result)=> {
            result.isSold = data.isSold;
            result.isCl = data.isCl;
            result.isPlayOut = false;
        return result.save().then((data)=> {
            socket.emit('lotUpdate', {
                err: 0,
                data: data
            });
            return Lot.findOne({
                where: {
                    isSold: false,
                    isCl: false,
                    auctionId: +data.auctionId
                },
                include: [LotPicture],
                order: [['id', 'ASC']]
            }).then((lot)=>{
                lot.isPlayOut = true;
                return lot.save().then((lot)=>{
                    socket.to('auction:'+(+data.auctionId)).emit('auctionState', {
                        lot: lot,
                        lotId: lot.id,
                        oldLotId: result.id,
                        isSold: data.isSold,
                        isCl: data.isCl
                    });
                    socket.emit('auctionState', {
                        oldLotId: result.id,
                        lotId: lot.id,
                        lot:lot,
                        isSold:data.isSold,
                        isCl: data.isCl
                    });
                })
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