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
    descriptionPrev: {type: Sequelize.TEXT, defaultValue: null},
    description: {type: Sequelize.TEXT, defaultValue: null},
    estimateFrom: {type: Sequelize.INTEGER, defaultValue: null},
    estimateTo: {type: Sequelize.INTEGER, defaultValue: null},
    sellingPrice: {type: Sequelize.INTEGER, defaultValue: null},
    year: {type: Sequelize.INTEGER, defaultValue: null},
    isArchive: {type: Sequelize.BOOLEAN, defaultValue: false},
    isSold: {type: Sequelize.BOOLEAN, defaultValue: false},
    isClean: {type: Sequelize.BOOLEAN, defaultValue: false},
    titlePicId: {type: Sequelize.INTEGER,  defaultValue: null},
    isPlayOut: {type: Sequelize.BOOLEAN, defaultValue: false}
};

module.exports.attributes = attributes;
// module.exports.options = options;
