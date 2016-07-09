/**
 * Created by piligrim on 06.07.16.
 */
var Sequelize = require('sequelize');

var attributes = {
    // roleName: {
    //     type: Sequelize.STRING,
    //     allowNull: false,
    //     unique: true,
    //     validate: {
    //         is: /^[a-z0-9\_\-]+$/i
    //     }
    // },
    number: {type: Sequelize.INTEGER},
    description: {type: Sequelize.TEXT},
    estimateFrom: {type: Sequelize.INTEGER},
    estimateTo: {type: Sequelize.INTEGER},
    sellingPrice: {type: Sequelize.INTEGER},
    year: {type: Sequelize.INTEGER},
    titlePicId: {type: Sequelize.INTEGER},
    isArchive: {type: Sequelize.BOOLEAN}
};

module.exports.attributes = attributes;
// module.exports.options = options;
