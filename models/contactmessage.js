'use strict';
const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class ContactMessage extends Model {

    static associate(models) {

    }
  }
  ContactMessage.init({
    name: DataTypes.STRING,
    email: DataTypes.STRING,
    category: DataTypes.STRING,
    subject: DataTypes.STRING,
    message: DataTypes.TEXT,
    status: DataTypes.STRING
  }, {
    sequelize,
    modelName: 'ContactMessage',
  });
  return ContactMessage;
};