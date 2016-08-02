/**
 * Created by piligrim on 01.08.16.
 */
'use strict';
let SellingStatistics = require('../../models/').SellingStatistics;
let AuctionUser = require('../../models/').AuctionUser;
const User = require('../../models/').User;
var mailSender = require("../mailSender");

module.exports = function (socket, data) {
    // console.log('>>>>>>>>>>>>>>>>>>>>>>>>>');
    // console.log(data);
    let where = {
        // auctionId: data.auctionId
        isSold: true
    };

    if (data.auctionId){where.auctionId = data.auctionId;}
    // if (data.userId){where.userId = data.userId;}


    SellingStatistics.findAll({
        where,
        include: [{model: User, attributes: ['email', 'id']}]
    }).then(function (result) {
        let statisticForSending = {};

        result.forEach(function (r) {
            if (!statisticForSending[r.user.id]){
                statisticForSending[r.user.id] = [];
            }
            statisticForSending[r.user.id].push({
                email: r.user.email,
                firstName: r.firstName,
                lastName: r.lastName,
                patronymic: r.patronymic,
                lotNumber: r.lotNumber,
                price: r.price,
                auctionId: r.auctionId,
                createdAt: r.createdAt,
            });
        });

        for (var i in statisticForSending){
            statisticForSending[i].forEach(function (row) {
                console.log('>+++++++++++++++');
                console.log(row);

                mailSender.send(data,(err) => {
                    if(err){
                        console.log('Error occurred');
                        console.log(error.message);
                    }
                })

            })
        }


        socket.emit('catchSellingStatisticsEmail', {
            'err': 0,
            sellingStatistics: result
        });
    }).catch(function (err) {
        socket.emit('catchSellingStatisticsEmail',
            {err: 1, message: err.message}
        );
    });
};