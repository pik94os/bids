/**
 * Created by piligrim on 17.07.16.
 */
'use strict';
let LotPicture = require('../../models/').LotPicture;


module.exports = function(socket, data) {
    let _lotPicture = {
        originalName: data.filename,
        isArchive: false
    };

    LotPicture.findOne({where: {originalName: data.filename}}).then(function (result) {
        if (result){
            _lotPicture.update();
        } else {
            LotPicture.create(_lotPicture);
        }
    });

};