/**
 * Created by Alex on 03.06.2016.
 */
var Sequelize = require('sequelize');

var attributes = {
    name: {
        type: Sequelize.STRING,
        allowNull: false,
        unique: true,
        validate: {
            is: /^[a-z0-9\_\-]+$/i
        }
    },
    description: {
        type: Sequelize.STRING
    }
};

var options = {
    freezeTableName : true,
    // setterMethods : {
    //     setRole  : function(value) {
    //         this.setDataValue('RoleId', value);
    //     }
    // },
    // getterMethods : {
    //     getRole : function() {
    //         return this.roleName
    //     }
    // }
};

module.exports.attributes = attributes;
module.exports.options = options;