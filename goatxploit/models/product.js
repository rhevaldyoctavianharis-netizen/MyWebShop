export default (sequelize, DataTypes) => {
  const Product = sequelize.define('Product', {
    name: {
      type: DataTypes.STRING,
      allowNull: false
    },
    slug: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    price: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    stock: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0
    },
    thumbnail: {
      type: DataTypes.STRING,
      allowNull: true
    },
    fileUrl: {
      type: DataTypes.STRING,
      allowNull: true
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      defaultValue: true
    }
  }, {
    tableName: 'Products',
    paranoid: true
  });

  Product.associate = (models) => {
    Product.belongsTo(models.Category, { foreignKey: 'categoryId' });
    Product.hasMany(models.OrderItem, { foreignKey: 'productId' });
  };

  return Product;
};
