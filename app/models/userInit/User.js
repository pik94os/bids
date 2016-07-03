var Sequelize = require('sequelize');

var attributes = {
    username: {
        type: Sequelize.STRING
        // allowNull: false,
        // unique: true,
        // validate: {
        //     is: /^[a-z0-9@\.\_\-]+$/i,
        // }
    },
    firstName: {
        type: Sequelize.STRING
    },
    lastName: {
        type: Sequelize.STRING
    },
    patronymic: {
        type: Sequelize.STRING
    },
    email: {
        type: Sequelize.STRING,
        validate: {
            isEmail: true
        }
    },
    phone: {
        type: Sequelize.INTEGER
    },
    confirmationCode: {
        type: Sequelize.INTEGER
    },
    password: {
        type: Sequelize.STRING
    },
    salt: {
        type: Sequelize.STRING
    },
    acceptTerms: {
        type: Sequelize.BOOLEAN
    },
    receiveMessages: {
        type: Sequelize.BOOLEAN
    },
    isArchive: {
        type: Sequelize.BOOLEAN
    }
};

var options = {
    freezeTableName: true,
    setterMethods: {
        setPassword: function (value) {
            this.setDataValue('password', value);
            this.setDataValue('salt', Math.round((new Date().valueOf() * Math.random())) + '');
        },

        setRole: function (value) {
            this.setDataValue('UserID', value);
        }
    }
};

module.exports.attributes = attributes;
module.exports.options = options;