'use strict';
const Auction = require('../../models/').Auction;
const Lot = require('../../models/').Lot;
const LotPicture = require('../../models/').LotPicture;
const User = require('../../models/').User;
const AuctionUser = require('../../models/').AuctionUser;

module.exports = function(socket, data) {
    if (!data.id) {
        socket.emit('room',
            {err: 1, message: 'Undefined auction identifier'}
        );
        return
    }
    const user = socket.request.user;
    let where = data.userAuction ? {auctionId: data.id} : '';
    let attributes = [];
        if(data.userAuction) {
            attributes = ["firstName", "lastName", "patronymic", "id", 'state', 'isArchive']
        } else {
            attributes = ["id", "username"]
        }
    Auction.findById(data.id,{
        where,
        include:[{
            model: Lot,
            attributes: ["id", "isPlayOut", "isSold", "titlePicId", "number", "isCl"]
        }, {
             model: User,
                attributes: attributes
            }
        ],
        order: '"lots"."number" ASC, "users.auction_user"."number" ASC'
    }).then(function(auction) {
        getPicturesTitle(auction.lots, function(err, LotPictures){
                socket.emit('room', {
                    err: 0,
                    auction: auction,
                    lotPictures: LotPictures,
                    authUser: user.userId
                });
            });
        socket.join('auction:' + data.id);
        }).catch(function (err) {
        socket.emit('room',
            {err: 1, message: err.message}
        );
    });

    function getPicturesTitle(lots, cb){
        var picIds = lots.map(function(e) { return e.titlePicId });
            LotPicture.findAll({
                where:{
                    id:{
                        $in:picIds
                    }
                }
            }).then(function(LotPictures) {
                  return cb(null, LotPictures);
            }).catch(function (err) {
                  return cb(err);
            })
    }
};