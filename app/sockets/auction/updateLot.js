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
        return result.save().then((auction)=> {
            socket.emit('lotUpdate', {
                err: 0,
                data: auction
            });
            //TODO: если что поправить auction на data
            return Lot.findOne({
                where: {
                    isSold: false,
                    isCl: false,
                    auctionId: +auction.auctionId
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
                        oldLot: result,
                        isSold: auction.isSold,
                        isCl: auction.isCl,
                        lastBid: data.lastBid
                    });
                    socket.emit('auctionState', {
                        oldLotId: result.id,
                        oldLot: result,
                        lotId: lot.id,
                        lot:lot,
                        isSold:data.isSold,
                        isCl: data.isCl,
                        lastBid: data.lastBid
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