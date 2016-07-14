/**
 * Created by piligrim on 14.07.16.
 */
'use strict';
const AuctionUser = require('../../models/').AuctionUser;

module.exports = function (socket, data) {
    if (data.userId){
        AuctionUser.findAll({
            where:{
                userId : data.userId
            }
        }).then(function(result){
            socket.emit('catchUserAuction', {
                'err': 0,
                userAuction: result
            });
        })
    }

};