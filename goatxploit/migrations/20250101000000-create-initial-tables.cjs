'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('Users', {
      id: { allowNull: false, autoIncrement: true, primaryKey: true, type: Sequelize.INTEGER },
      username: { type: Sequelize.STRING, allowNull: false, unique: true },
      email: { type: Sequelize.STRING, allowNull: false, unique: true },
      password: { type: Sequelize.STRING, allowNull: false },
      role: { type: Sequelize.ENUM('user', 'admin'), allowNull: false, defaultValue: 'user' },
      balance: { type: Sequelize.INTEGER, allowNull: false, defaultValue: 0 },
      createdAt: { allowNull: false, type: Sequelize.DATE },
      updatedAt: { allowNull: false, type: Sequelize.DATE }
    });

    await queryInterface.createTable('Categories', {
      id: { allowNull: false, autoIncrement: true, primaryKey: true, type: Sequelize.INTEGER },
      name: { type: Sequelize.STRING, allowNull: false },
      slug: { type: Sequelize.STRING, allowNull: false, unique: true },
      createdAt: { allowNull: false, type: Sequelize.DATE },
      updatedAt: { allowNull: false, type: Sequelize.DATE }
    });

    await queryInterface.createTable('Products', {
      id: { allowNull: false, autoIncrement: true, primaryKey: true, type: Sequelize.INTEGER },
      name: { type: Sequelize.STRING, allowNull: false },
      slug: { type: Sequelize.STRING, allowNull: false, unique: true },
      description: { type: Sequelize.TEXT, allowNull: false },
      price: { type: Sequelize.INTEGER, allowNull: false },
      stock: { type: Sequelize.INTEGER, allowNull: false, defaultValue: 0 },
      thumbnail: { type: Sequelize.STRING },
      fileUrl: { type: Sequelize.STRING },
      categoryId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: 'Categories', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'RESTRICT'
      },
      isActive: { type: Sequelize.BOOLEAN, defaultValue: true },
      createdAt: { allowNull: false, type: Sequelize.DATE },
      updatedAt: { allowNull: false, type: Sequelize.DATE },
      deletedAt: { type: Sequelize.DATE }
    });

    await queryInterface.createTable('Deposits', {
      id: { allowNull: false, autoIncrement: true, primaryKey: true, type: Sequelize.INTEGER },
      userId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: 'Users', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      amount: { type: Sequelize.INTEGER, allowNull: false },
      method: { type: Sequelize.ENUM('BCA', 'DANA', 'QRIS'), allowNull: false },
      proofUrl: { type: Sequelize.STRING, allowNull: false },
      status: { type: Sequelize.ENUM('PENDING', 'APPROVED', 'REJECTED'), allowNull: false, defaultValue: 'PENDING' },
      note: { type: Sequelize.TEXT },
      reviewedBy: {
        type: Sequelize.INTEGER,
        references: { model: 'Users', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL'
      },
      createdAt: { allowNull: false, type: Sequelize.DATE },
      updatedAt: { allowNull: false, type: Sequelize.DATE }
    });

    await queryInterface.createTable('Orders', {
      id: { allowNull: false, autoIncrement: true, primaryKey: true, type: Sequelize.INTEGER },
      userId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: 'Users', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      totalAmount: { type: Sequelize.INTEGER, allowNull: false },
      status: { type: Sequelize.ENUM('COMPLETED', 'REFUNDED'), allowNull: false, defaultValue: 'COMPLETED' },
      createdAt: { allowNull: false, type: Sequelize.DATE },
      updatedAt: { allowNull: false, type: Sequelize.DATE }
    });

    await queryInterface.createTable('OrderItems', {
      id: { allowNull: false, autoIncrement: true, primaryKey: true, type: Sequelize.INTEGER },
      orderId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: 'Orders', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      productId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: 'Products', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'RESTRICT'
      },
      price: { type: Sequelize.INTEGER, allowNull: false },
      licenseKey: { type: Sequelize.STRING, allowNull: false },
      createdAt: { allowNull: false, type: Sequelize.DATE },
      updatedAt: { allowNull: false, type: Sequelize.DATE }
    });

    await queryInterface.createTable('BalanceLogs', {
      id: { allowNull: false, autoIncrement: true, primaryKey: true, type: Sequelize.INTEGER },
      userId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: 'Users', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      type: { type: Sequelize.ENUM('DEPOSIT', 'PURCHASE', 'ADJUSTMENT'), allowNull: false },
      amount: { type: Sequelize.INTEGER, allowNull: false },
      note: { type: Sequelize.TEXT },
      createdAt: { allowNull: false, type: Sequelize.DATE }
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable('BalanceLogs');
    await queryInterface.dropTable('OrderItems');
    await queryInterface.dropTable('Orders');
    await queryInterface.dropTable('Deposits');
    await queryInterface.dropTable('Products');
    await queryInterface.dropTable('Categories');
    await queryInterface.dropTable('Users');
  }
};
