/**
 * Created by piligrim on 14.08.16.
 */
'use strict';

const Lot = require('../../models').Lot;
module.exports = function (socket, data) {
    console.log('>>>>>>>>>>>>>>>>>>>.')
    console.log(data)
    Lot.findOne({
        where:{id: data.lotId}
    }).then((result)=> {

        result.isArchive = data.isArchive;
        // if (data.isArchive) {result.isArchive = data.isArchive}
        result.save();
    });
};