/**
 * Created by piligrim on 05.07.16.
 */
'use strict';
let Auction = require('../../models/').Auction;
let Lot = require('../../models/').Lot;
let AuctionUser = require('../../models/').AuctionUser;
let sequelize = require('sequelize');

module.exports = function(socket, data) {


    let where = {
        isArchive : false
    };
    if(!data.public && !data.forLeader){
        where = {userId: socket.request.user.id, isArchive:false};
    }

    if (!data.forLeader){
        Auction.findAll({where,
            include: Lot})
            .then(function(auctionList) {
                socket.emit('auctionList', {
                    'err': 0,
                    auctionList: auctionList
                });
            }).catch(function (err) {
            socket.emit('auctionList',
                {err: 1, message: err.message}
            );
        });
    }

    if (data.forLeader){
        Auction.findAll({where,
            include: [
                {model:AuctionUser,attributes:[]},
                {model:Lot,attributes:[]},
            ],
            attributes:['id','name','isClose',
                [sequelize.fn('count', sequelize.fn('DISTINCT',sequelize.col('auction_users.userId'))), 'users_count'],
                [sequelize.fn('count', sequelize.fn('DISTINCT',sequelize.col('lots.id'))), 'lots_count']
                // ,
                // [sequelize.fn('sum', sequelize.col('lots.isSold'), 'allLots_count')]
            ],
            group: ['auction.id']
        })
            .then(function(auctionList) {
                socket.emit('auctionListForLeader', {
                    'err': 0,
                    auctionList: auctionList
                });
            }).catch(function (err) {
            socket.emit('auctionListForLeader',
                {err: 1, message: err.message}
            );
        });
    }

};