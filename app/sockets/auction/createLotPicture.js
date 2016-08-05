/**
 * Created by piligrim on 17.07.16.
 */
'use strict';
let LotPicture = require('../../models/').LotPicture;

module.exports = function(socket, data) {
    // console.log('>>>>>>>>>>>');
    // console.log(data);
    let _lotPicture = {
        originalName: data.originalName,
        fileName: data.fileName,
        // lotId: data.lotId,
        isArchive: false
    };

    if (data.lotId){_lotPicture.lotId = data.lotId}

    LotPicture.create(_lotPicture);

    // LotPicture.findOne({where: {originalName: data.filename}}).then(function (result) {
    //     if (result){
    //         _lotPicture.update();
    //     } else {
    //         LotPicture.create(_lotPicture);
    //     }
    // }).then(function (result) {
    //     socket.emit('createCSVPicturesReport', {
    //             pictureRow: result
    //         }
    //     );
    // });
};