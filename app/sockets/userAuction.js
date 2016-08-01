/**
 * Created by emmtech on 11.07.16.
 */

'use strict';
const AuctionUser = require('../models/').AuctionUser;
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
                    userId: socket.request.user.id,
                    auctionId: data.auctionId
                }
            }).then((info) => {
                if(info){
                return socket.emit('auctionUserStop',{info});
            }
            return AuctionUser.create({
                userId: socket.request.user.id,
                auctionId: data.auctionId,
                number: number
            }).then(() => {
                socket.emit('auctionUser',{err:0,info});
            })
        });
    }

};