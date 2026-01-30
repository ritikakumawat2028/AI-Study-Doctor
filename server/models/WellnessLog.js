const { DataTypes } = require('sequelize');
const sequelize = require('../database');

const WellnessLog = sequelize.define('WellnessLog', {
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  mood: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  stress: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  sleepHours: {
    type: DataTypes.FLOAT,
    allowNull: false,
  },
  sleepQuality: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  notes: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  date: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
  }
});

module.exports = WellnessLog;
