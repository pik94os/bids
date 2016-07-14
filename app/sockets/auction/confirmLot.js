/**
 * Created by piligrim on 06.07.16.
 */
'use strict';
const Lot = require('../../models/').Lot;
const User = require('../../models/').User;
const Bid = require('../../models/').Bid;


module.exports = function(socket, data) {
    if (!data.lotId) {
        socket.emit('lotConfirmed',
            {err: 1, message: 'Undefined identifier'}
        );
        return
    }

    const user = socket.request.user;

    if(!socket.request.user.logged_in){
        socket.emit('lotConfirmed',
            {err: 1, message: 'Пройдите регистрацию и сделайте ставку'}
        );
        return
    }

    findLot(data.lotId, function(err, lot){
        if (err) return emitError(socket, err);
        if (err) return emitError(socket, err);
            findUser(user.id, function (err, user){
                if (err) return emitError(socket, err);
                checkBid(data.bidPrice, lot.sellingPrice, lot.estimateFrom, function(err){
                    if (err) return emitError(socket, err);
                Bid.create({price: data.bidPrice, lotId: lot.id, creatorId: user.id})
                    .then(function (bid){
                        lot.sellingPrice=data.bidPrice;
                        return lot.save().then(function (lot) {
                            socket.emit('lotConfirmed',
                                {err: 0, bid: bid});
                            socket.to('auction:'+(+lot.auctionId)).emit('lotConfirmed', {err: 0, bid: bid});
                        });
                    }).catch(function (err) {
                        return emitError(socket, err);
                    })
                })
            })
    });

    function findLot(lotId, cb){
        Lot.findById(lotId)
            .then(function(lot) {
                return cb(null, lot);
            })
            .catch(function (err) {
                return cb(err);
            })

    }
    function findUser(userId, cb){
        User.findById(userId)
            .then(function(user){
                    return cb(null, user)
            })
            .catch(function (err) {
                    return cb (err);
            })
    }

    function emitError(socket, err){
        socket.emit('lotConfirmed',
            {err: 1, message: err.message})

    }
    function checkBid(bid, currentPrice, estimateFrom, cb){
        var step = calcStep(estimateFrom);
        if (Number(bid) - Number(estimateFrom) < 0)
            return cb({message: "Бид ниже минимальной цены"});
        // if (Number(bid) - Number(estimateFrom) < step)
        //     return cb({message: "Бид ниже минимального шага"});
        if (Number(bid) - Number(currentPrice) < step)
            return cb({message: "Бид ниже текущей цены"});
        return cb (null);
    }


    function calcStep(price){
        var step = 1;
        if (price <= 5){
            step = 1;
        }
        if (5 < price &&  price <= 50){
            step = 5;
        }
        if (50 < price && price <= 200){
            step = 10;
        }
        if (200 < price && price <= 500){
            step = 20;
        }
        if (500 < price && price <= 1000){
            step = 50;
        }
        if (1000 < price && price <= 2000) {
            step = 100;
        }
        if (2000 < price && price <= 5000){
            step = 200;
        }
        if (5000 < price && price <= 10000){
            step = 500;
        }
        if (10000 < price && price <= 20000){
            step = 1000;
        }
        if (20000 < price && price <= 50000){
            step = 2000;
        }
        if (50000 < price && price <= 100000){
            step = 5000;
        }
        if (100000 < price && price <= 200000){
            step = 10000;
        }
        if (200000 < price && price <= 500000){
            step = 20000;
        }
        if (500000 < price && price <= 1000000){
            step = 50000;
        } else {
            step = 100000;
        }
        return step;
    }

};