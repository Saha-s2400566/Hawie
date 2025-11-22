const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const AnalyticsSnapshot = sequelize.define('AnalyticsSnapshot', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    date: {
        type: DataTypes.DATEONLY,
        allowNull: false,
        unique: true
    },
    totalBookings: {
        type: DataTypes.INTEGER,
        defaultValue: 0
    },
    completedBookings: {
        type: DataTypes.INTEGER,
        defaultValue: 0
    },
    cancelledBookings: {
        type: DataTypes.INTEGER,
        defaultValue: 0
    },
    totalRevenue: {
        type: DataTypes.DECIMAL(10, 2),
        defaultValue: 0.00
    },
    newUsers: {
        type: DataTypes.INTEGER,
        defaultValue: 0
    }
}, {
    timestamps: true
});

module.exports = AnalyticsSnapshot;
