const { DataTypes } = require('sequelize');
const sequelize = require('../database');

const Despesa = sequelize.define('Despesa', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  valor: { type: DataTypes.FLOAT, allowNull: false },
  data: { type: DataTypes.DATE, allowNull: false },
  descricao: { type: DataTypes.STRING }
});

module.exports = Despesa;