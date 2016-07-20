/**
 * Created by piligrim on 06.07.16.
 */
'use strict';

var Lot = require('../../models/').Lot;
var LotPicture = require('../../models/').LotPicture;
var Sequelize = require('sequelize');

module.exports = function(socket, data) {
    if (!data.auctionId) {
        socket.emit('lotList',
            {err: 1, message: 'Undefined auction identifier'}
        );
        return
    }
    // если делать эту строку то назад возвращаются только ID лотов и на странице аукциона не будут выводиться описания лотов и тд:
    //Lot.findAll({attributes: ['id'],where: {auctionId: data.auctionId}})
    // если раскомментировать эту строку то на странице аукциона будет выводиться вся информация о лоте но вся вестка поползет:
    let where = data.lot ? {
        isSold: false,
        isCl: false,
        isArchive: false,
        auctionId: data.auctionId
    } : {auctionId: data.auctionId};
    if(data.numberLot !== undefined && data.numberLot) {
        where = {
            auctionId: data.auctionId,
            isCl: true,
            isArchive: false,
            number: +data.numberLot
        }
    }
    let select = {
        where,
        order:[['number', 'ASC']],
        // include: [{model:LotPicture, where: {id: Sequelize.col('lot.titlePicId')}}]
        include: [{model:LotPicture}]
    };
    if(data.selectLot){
        console.log(data.selectLot);
        select = {
            order:[['number', 'ASC']],
            where: {isArchive:false, auctionId: data.auctionId},
            attributes: ['id']
        }
    }
    Lot.findAll(select)
        .then(function(lotList) {
            socket.emit('lotList', {
                'err': 0,
                lotList: lotList
            });
            return Lot.count({
                where: {
                    auctionId: data.auctionId,
                    isCl: false,
                    isSold: false
                }
            }).then((count)=> {
                if (!count) {
                    socket.emit('countDown', {});
                }
                socket.join('auction:' + data.auctionId);
            })
        }).catch(function (err) {
        socket.emit('lotList',
            {err: 1, message: err.message}
        );
    })
};