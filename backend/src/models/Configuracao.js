const { DataTypes } = require('sequelize');
const sequelize = require('../database');

const Configuracao = sequelize.define('Configuracao', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  metaFaturamento: { type: DataTypes.FLOAT, allowNull: false, defaultValue: 0 }
});

module.exports = Configuracao;