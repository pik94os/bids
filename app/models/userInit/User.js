var Sequelize = require('sequelize');

var attributes = {
    username: {
        type: Sequelize.STRING,
        allowNull: false,
        unique: true,
        validate: {
            is: /^[a-z0-9\_\-]+$/i,
        }
    },
    email: {
        type: Sequelize.STRING,
        validate: {
            isEmail: true
        }
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
    password: {
        type: Sequelize.STRING
    },
    introduce: {//КТО ВНЕДРЯЕТ
        type: Sequelize.STRING
    },
    phone: {
        type: Sequelize.STRING
    },
    implementing: {//КУДА ВНЕДРЯЕТ
        type: Sequelize.STRING
    },
    numberOfClasses: {
        type: Sequelize.INTEGER
    },
    salt: {
        type: Sequelize.STRING
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
        
        setRole: function(value) {
            this.setDataValue('UserID', value);    
        }
    }
};

module.exports.attributes = attributes
module.exports.options = options