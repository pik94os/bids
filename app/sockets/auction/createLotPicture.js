/**
 * Created by piligrim on 17.07.16.
 */
'use strict';
let LotPicture = require('../../models/').LotPicture;
let Lot = require('../../models/').Lot;

module.exports = function(socket, data) {

    let _lotPicture = {
        originalName: data.originalName,
        fileName: data.fileName,
        // lotId: data.lotId,
        isArchive: false
    };

    if (data.lotId){_lotPicture.lotId = data.lotId}

    LotPicture.create(_lotPicture).then(function (result) {
        if (data.topPic){
            let lotTopPic = {
              titlePicId: result.id
            };
            Lot.update(lotTopPic, {where: {id: data.lotId}});
        }
    });
};