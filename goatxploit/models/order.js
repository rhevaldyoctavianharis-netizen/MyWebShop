export default (sequelize, DataTypes) => {
  const Order = sequelize.define('Order', {
    totalAmount: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    status: {
      type: DataTypes.ENUM('COMPLETED', 'REFUNDED'),
      defaultValue: 'COMPLETED'
    }
  }, {
    tableName: 'Orders'
  });

  Order.associate = (models) => {
    Order.belongsTo(models.User, { foreignKey: 'userId' });
    Order.hasMany(models.OrderItem, { foreignKey: 'orderId' });
  };

  return Order;
};
