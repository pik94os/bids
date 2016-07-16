/**
 * Created by Alex on 30.05.2016.
 */
'use strict';

var Auction = require('../../models/').Auction;

module.exports = function(socket, data) {
    const user = socket.request.user;

    if (!((data.name.trim()) && (+data.number))) {
        socket.emit('auctionCreated',
            {err: 1, message: 'Incorrect name or number'}
        );
        return
    }

    if (data.isDelete == true){
        if (data.editId){
            Auction.update(
                {isArchive: true}
                , {
                    where: {id: +data.editId}
                }).then(function (auction) {
                socket.emit('auctionEdited', {
                    'err': 0,
                    auction: {
                        id : data.editId,
                        isDelete: true
                    }
                });
            }).catch(function (err) {
                socket.emit('auctionEdited',
                    {err: 1, message: err.message}
                );
            })
        }
    } else {
        let auctionData = {
            name: data.name.trim()+'',
            number: +data.number,
            date: `${+data.date[2]}-${+data.date[1]}-${+data.date[0]} ${+data.date[3]}:${+data.date[4]}:00.000 +00:00`,
            userId: +data.userId,
            isArchive: false
        };
        if (data.editId){
            Auction.update(
                auctionData
                , {
                    where: {id: +data.editId}
                }).then(function (auction) {
                socket.emit('auctionEdited', {
                    'err': 0,
                    auction: {
                        id : data.editId
                    }
                });
            }).catch(function (err) {
                socket.emit('auctionEdited',
                    {err: 1, message: err.message}
                );
            })
        }

        if (!data.editId) {
            Auction.create(auctionData)
                .then(function (auction) {
                    socket.emit('auctionCreated', {
                        'err': 0,
                        auction: {
                            id : auction.id,
                            name : auction.name
                        }
                    });
                }).catch(function (err) {
                socket.emit('auctionCreated',
                    {err: 1, message: err.message}
                );
            })
        }
    }


};