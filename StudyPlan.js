const { DataTypes } = require('sequelize');
const sequelize = require('../database');

const StudyPlan = sequelize.define('StudyPlan', {
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  schedule: {
    type: DataTypes.TEXT, // Storing JSON string of the plan
    allowNull: false,
    defaultValue: '[]'
  },
  examDate: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  goals: {
    type: DataTypes.TEXT,
    allowNull: true,
  }
});

module.exports = StudyPlan;
