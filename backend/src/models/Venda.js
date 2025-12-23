const { DataTypes } = require('sequelize');
const sequelize = require('../database');

const Venda = sequelize.define('Venda', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  valor: { type: DataTypes.FLOAT, allowNull: false },
  data: { type: DataTypes.DATE, allowNull: false },
  descricao: { type: DataTypes.STRING }
});

module.exports = Venda;