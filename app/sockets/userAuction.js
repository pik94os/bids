/**
 * Created by emmtech on 11.07.16.
 */

'use strict';
const AuctionUser = require('../models/').AuctionUser;
const SellingStatistics = require(('../models/')).SellingStatistics;
module.exports = function (socket, data) {
    if(!data.auctionId) {
        socket.emit('auctionUser', {
            err: 1,
            message: 'not auctionId'
        });
        return
    }
    AuctionUser.findAll({
        where: {
            auctionId: data.auctionId
        }
    }).then(function (info) {
        createAuctionUser(info.length + 1);
    }).catch(function (err) {
        socket.emit('auctionUserStop',
            {err: 1, message: err.message}
        );
    });
    function createAuctionUser(number) {
            AuctionUser.find({
                where:{
                    userId: data.lotConfirmed ? data.userId : socket.request.user.id,
                    auctionId: data.auctionId
                }
            }).then((info) => {
                if(data.lotConfirmed && info){
                    return socket.emit('auctionUserStop',{info});
                } else if(!data.lotConfirmed && info) {
                    return socket.emit('auctionCurrentUserNumber',{info});
                }
            return AuctionUser.create({
                userId: socket.request.user.id,
                auctionId: data.auctionId,
                number: number,
                isArchive: false
            }).then((auctionUser) => {
                socket.emit('auctionUser',{err:0,info});
                socket.to('auction:' + (+auctionUser.auctionId)).emit('newUserRoom');
            })
        });
    }

};