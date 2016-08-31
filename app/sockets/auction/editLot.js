/**
 * Created by pik on 29.08.16.
 */
'use strict';

const Lot = require('../../models').Lot;
let LotPicture = require('../../models/').LotPicture;

module.exports = function (socket, data) {
    if (!data.id) {
        socket.emit('lotEdited', {
            err: 1,
            message: 'Undefined lot identifier'
        });
        return
    }
    Lot.findById(data.id).then((lot)=> {
        lot.number = data.number;
        lot.descriptionPrev = data.descriptionPrev;
        lot.estimateFrom = data.estimateFrom;
        lot.estimateTo = data.estimateTo;
        lot.year = data.year;
        lot.save().then((result)=>{
            socket.emit('lotEdited', {
                err: 0,
                result: result
            });
        });
    }).catch((err)=> {
        socket.emit('lotEdited', {
            err: 1,
            message: err.message
        });
    });

    if (data.picId){
        LotPicture.findById(+data.picId).then((lotPic)=>{
            lotPic.isArchive = data.isArchive;
            lotPic.save().then(()=>{
                socket.emit('lotPicDeleted', {
                    err: 0,
                    picStatus: data.picStatus
                });
            });
        });
        if (data.picStatus == 'titlePic'){
            Lot.findById(data.id).then((lot)=> {
                lot.titlePicId = null;
                lot.save();
            })
        }
    }
};