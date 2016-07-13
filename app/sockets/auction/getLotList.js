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
     Lot.findAll({
         where: {
             isArchive:false,
             auctionId: data.auctionId,
             isSold: false,
             isClean: false
         },
         order:[['number', 'ASC']],
         // include: [{model:LotPicture, where: {id: Sequelize.col('lot.titlePicId')}}]
         include: [{model:LotPicture}]
     })
        .then(function(lotList) {
            socket.emit('lotList', {
                'err': 0,
                lotList: lotList
            });
            
        }).catch(function (err) {
        socket.emit('lotList',
            {err: 1, message: err.message}
        );
    })
};