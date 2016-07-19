/**
 * Created by piligrim on 19.07.16.
 */
var Sequelize = require('sequelize');

var attributes = {
    userId: {type: Sequelize.INTEGER},
    firstName: {type: Sequelize.STRING},
    lastName: {type: Sequelize.STRING},
    patronymic: {type: Sequelize.STRING},
    
    lotId: {type: Sequelize.INTEGER},
    lotNumber: {type: Sequelize.INTEGER},
    price: {type: Sequelize.INTEGER},
    auctionId: {type: Sequelize.INTEGER},

    isSold: {type: Sequelize.BOOLEAN},
    isCl: {type: Sequelize.BOOLEAN}
};

module.exports.attributes = attributes;
// module.exports.options = options;