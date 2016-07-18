'use strict';
const Auction = require('../../models/').Auction;
const Lot = require('../../models/').Lot;
const LotPicture = require('../../models/').LotPicture;
const User = require('../../models/').User;
const UserAuction = require('../../models').AuctionUser;


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

            attributes = ["firstName", "lastName", "patronymic", "id"]
        } else {
            attributes = ["id", "username"]
        }
    Auction.findById(data.id,{
        include:[{
            model: Lot,
            attributes: ["id", "isPlayOut", "isSold", "titlePicId", "number"]
        }, {
             model: User,
                attributes: attributes
            }
        ],
        order: [
            [Lot, 'number', 'ASC'],
            [User, 'id', 'ASC']
        ]
    }).then(function(auction) {
            getPicturesTitle(auction.lots, function(err, LotPictures){
                getUsersNumber(auction.users, function(err, UserNumbers){
                    socket.emit('room', {
                        err: 0,
                        auction: auction,
                        lotPictures: LotPictures,
                        authUser: user.userId,
                        userNumbers: UserNumbers
                    });
                });
            });
        socket.join('auction:' + data.id);
        }).catch(function (err) {
        socket.emit('room',
            {err: 1, message: err.message}
        );
    })

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

    function getUsersNumber(users, cb){
        var userIds = users.map(function(e) { return e.id });
            UserAuction.findAll({
                where:{
                    userId:{
                        $in:userIds
                    }
                }
            }).then(function(result) {
                    return cb(null, result);
            }).catch(function (err) {
                    return cb(err);
            })
    }
};