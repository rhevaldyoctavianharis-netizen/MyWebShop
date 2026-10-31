import { Sequelize, DataTypes } from 'sequelize';
import dbConfig from '../config/database.js';
import userModel from './user.js';
import categoryModel from './category.js';
import productModel from './product.js';
import depositModel from './deposit.js';
import orderModel from './order.js';
import orderItemModel from './orderItem.js';
import balanceLogModel from './balanceLog.js';

const sequelize = dbConfig.use_env_variable
  ? new Sequelize(process.env[dbConfig.use_env_variable], dbConfig)
  : new Sequelize(dbConfig);

const db = {};

db.sequelize = sequelize;
db.Sequelize = Sequelize;

db.User = userModel(sequelize, DataTypes);
db.Category = categoryModel(sequelize, DataTypes);
db.Product = productModel(sequelize, DataTypes);
db.Deposit = depositModel(sequelize, DataTypes);
db.Order = orderModel(sequelize, DataTypes);
db.OrderItem = orderItemModel(sequelize, DataTypes);
db.BalanceLog = balanceLogModel(sequelize, DataTypes);

Object.values(db)
  .filter((model) => model && model.associate)
  .forEach((model) => model.associate(db));

export default db;
