/**
 * Created by piligrim on 06.07.16.
 */
'use strict';
const Lot = require('../../models/').Lot;
const User = require('../../models/').User;
const Bid = require('../../models/').Bid;
const Auction = require('../../models/').Auction;

module.exports = function(socket, data) {
    if (!data.lotId) {
        socket.emit('lotConfirmed',
            {err: 1, message: 'Undefined identifier'}
        );
        return
    }
    const user = socket.request.user;

    if(!user.logged_in){
        socket.emit('lotConfirmed',
            {err: 1, message: 'Пройдите регистрацию и сделайте ставку'}
        );
        return
    }
    findLot(data.lotId, function(err, lot){
        if (err) return emitError(socket, err);
                if (err) return emitError(socket, err);
                checkBid(data.bidPrice, lot.sellingPrice, lot.estimateFrom, lot.auction.start, function(err){
                    if (err) return emitError(socket, err);
                Bid.create({ price: data.bidPrice,
                    lotId: lot.id,
                    userId: data.extramuralBid ? data.userId : user.id,
                    auctionId: data.auctionId
                })
                    .then(function (bid){
                        if (lot.isPlayOut) {
                            return Bid.findOne({
                                where: {
                                    createdAt: {$lte: lot.auction.start},
                                    lotId: data.lotId
                                },
                                order:[['price', 'DESC'],['createdAt', 'ASC']]
                            }).then((maxExtramuralBid)=>{
                                let tempBid = false;
                                lot.sellingPrice = data.bidPrice;
                                if(maxExtramuralBid !== null){
                                    let bidRazn = +maxExtramuralBid.price - bid.price;
                                    if (bidRazn > 0 && bidRazn <= calcStep(bid.price)) {
                                        tempBid = true;
                                        lot.sellingPrice = +maxExtramuralBid.price;
                                        bid.price = +maxExtramuralBid.price;
                                        lot.userId = +maxExtramuralBid.userId;
                                        bid.userId = +maxExtramuralBid.userId;
                                    }
                                }
                                
                                return lot.save().then(function (lot) {
                                    if(tempBid) {
                                        return bid.save().then(()=>{
                                            return User.findById(bid.userId);
                                        }).then((newUser)=>{
                                            console.log(bid.userId,newUser.id,user.id);
                                            if(user.id !== newUser.id) {
                                                socket.emit('lotConfirmed',
                                                    {err: 1, message: "Ваша ставка была перебита другим игроком"});
                                                socket.emit('lotConfirmed',
                                                    {err: 0, bid: bid});
                                                socket.to('auction:' + (+lot.auctionId)).emit('lotConfirmed', {
                                                    err: 0,
                                                    bid: bid,
                                                    userName: {
                                                        id:newUser.id,
                                                        firstName:newUser.firstName,
                                                        lastName:newUser.lastName,
                                                        patronymic:newUser.patronymic
                                                    }
                                                });
                                            } else {
                                                socket.emit('lotConfirmed',
                                                    {err: 0, bid: bid});
                                                socket.to('auction:' + (+lot.auctionId)).emit('lotConfirmed', {
                                                    err: 0,
                                                    bid: bid,
                                                    userName: {
                                                        id:newUser.id,
                                                        firstName:newUser.firstName,
                                                        lastName:newUser.lastName,
                                                        patronymic:newUser.patronymic
                                                    }
                                                });
                                            }
                                        });                                        
                                    }else{
                                        return lot.save().then(function (lot) {
                                            socket.emit('lotConfirmed',
                                                {err: 0, bid: bid});
                                            socket.to('auction:' + (+lot.auctionId)).emit('lotConfirmed', {
                                                err: 0,
                                                bid: bid,
                                                // lot: lot,
                                                userName: {
                                                    id:user.id,
                                                    firstName:user.firstName,
                                                    lastName:user.lastName,
                                                    patronymic:user.patronymic
                                                }
                                            });
                                        });
                                    }
                                });
                            });

                        } else {
                            return lot.save().then(function (lot) {
                                socket.emit('lotConfirmed',
                                    {err: 0, bid: bid});
                                socket.to('auction:' + (+lot.auctionId)).emit('lotConfirmed', {
                                    err: 0,
                                    bid: bid,
                                    // lot: lot,
                                    userName: {
                                        id:user.id,
                                        firstName:user.firstName,
                                        lastName:user.lastName,
                                        patronymic:user.patronymic
                                    }
                                });
                            });
                        }


                    }).catch(function (err) {
                        return emitError(socket, err);
                    })
                })
    });

    function findLot(lotId, cb){
        Lot.findById(lotId, {
            include: [{model: Auction, attributes: ['id', 'start']}]
        })
            .then(function(lot) {
                if (lot.auction.start && !lot.isPlayOut) {
                    return cb({message: "Аукцион начат, но лот ещё не разыгрывается"});
                }
                return cb(null, lot);
            })
            .catch(function (err) {
                return cb(err);
            })

    }

    function emitError(socket, err){
        socket.emit('lotConfirmed',
            {err: 1, message: err.message})

    }
    function checkBid(bid, currentPrice, estimateFrom, start, cb){
        var step = calcStep(currentPrice);
        if (Number(bid) - Number(estimateFrom) < 0)
            return cb({message: "Бид ниже минимальной цены"});
        // if (Number(bid) - Number(estimateFrom) < step)
        //     return cb({message: "Бид ниже минимального шага"});
        if(start) {
            if (Number(bid) - Number(currentPrice) < step)
            return cb({message: "Бид ниже текущей цены"});
        }
        return cb (null);
    }

    function lotSave(socket,lot,bid,user,cb) {
        return lot.save().then(function (lot) {
            socket.emit('lotConfirmed',
                {err: 0, bid: bid});
            socket.to('auction:' + (+lot.auctionId)).emit('lotConfirmed', {
                err: 0,
                bid: bid,
                // lot: lot,
                userName: {
                    id:user.id,
                    firstName:user.firstName,
                    lastName:user.lastName,
                    patronymic:user.patronymic
                }
            });
        });
    }


    function calcStep(price){
        var step = 1;
        if (price < 5){
            return step = 1;
        }
        if (5 <= price &&  price < 50){
            return step = 5;
        }
        if (50 <= price && price < 200){
            return step = 10;
        }
        if (200 <= price && price < 500){
            return step = 20;
        }
        if (500 <= price && price < 1000){
            return step = 50;
        }
        if (1000 <= price && price < 2000) {
            return step = 100;
        }
        if (2000 <= price && price < 5000){
            return step = 200;
        }
        if (5000 <= price && price < 10000){
            return step = 500;
        }
        if (10000 <= price && price < 20000){
            return step = 1000;
        }
        if (20000 <= price && price < 50000){
            return step = 2000;
        }
        if (50000 <= price && price < 100000){
            return step = 5000;
        }
        if (100000 <= price && price < 200000){
            return step = 10000;
        }
        if (200000 <= price && price < 500000){
            return step = 20000;
        }
        if (500000 <= price && price < 1000000){
            return step = 50000;
        } else {
            step = 100000;
        }
        return step;
    }

};