export default (sequelize, DataTypes) => {
  const Deposit = sequelize.define('Deposit', {
    amount: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    method: {
      type: DataTypes.ENUM('BCA', 'DANA', 'QRIS'),
      allowNull: false
    },
    proofUrl: {
      type: DataTypes.STRING,
      allowNull: false
    },
    status: {
      type: DataTypes.ENUM('PENDING', 'APPROVED', 'REJECTED'),
      defaultValue: 'PENDING'
    },
    note: {
      type: DataTypes.TEXT,
      allowNull: true
    }
  }, {
    tableName: 'Deposits'
  });

  Deposit.associate = (models) => {
    Deposit.belongsTo(models.User, { foreignKey: 'userId' });
    Deposit.belongsTo(models.User, { foreignKey: 'reviewedBy', as: 'reviewer' });
  };

  return Deposit;
};
