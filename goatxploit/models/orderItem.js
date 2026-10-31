export default (sequelize, DataTypes) => {
  const OrderItem = sequelize.define('OrderItem', {
    price: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    licenseKey: {
      type: DataTypes.STRING,
      allowNull: false
    }
  }, {
    tableName: 'OrderItems'
  });

  OrderItem.associate = (models) => {
    OrderItem.belongsTo(models.Order, { foreignKey: 'orderId' });
    OrderItem.belongsTo(models.Product, { foreignKey: 'productId' });
  };

  return OrderItem;
};
