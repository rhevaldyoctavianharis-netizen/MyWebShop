export default (sequelize, DataTypes) => {
  const BalanceLog = sequelize.define('BalanceLog', {
    type: {
      type: DataTypes.ENUM('DEPOSIT', 'PURCHASE', 'ADJUSTMENT'),
      allowNull: false
    },
    amount: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    note: {
      type: DataTypes.TEXT,
      allowNull: true
    }
  }, {
    tableName: 'BalanceLogs',
    updatedAt: false
  });

  BalanceLog.associate = (models) => {
    BalanceLog.belongsTo(models.User, { foreignKey: 'userId' });
  };

  return BalanceLog;
};
