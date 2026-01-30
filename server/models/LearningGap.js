const { DataTypes } = require('sequelize');
const sequelize = require('../database');

const LearningGap = sequelize.define('LearningGap', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  concept: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  subject: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  confidence: {
    type: DataTypes.INTEGER,
    defaultValue: 50,
  },
  status: {
    type: DataTypes.STRING,
    defaultValue: 'Needs Revision',
  },
  revisionTopic: {
    type: DataTypes.STRING,
  },
  activity: {
    type: DataTypes.STRING,
  }
});

module.exports = LearningGap;
