import bcrypt from 'bcrypt';

export default (sequelize, DataTypes) => {
  const User = sequelize.define('User', {
    username: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false
    },
    role: {
      type: DataTypes.ENUM('user', 'admin'),
      defaultValue: 'user'
    },
    balance: {
      type: DataTypes.INTEGER,
      defaultValue: 0
    }
  }, {
    tableName: 'Users',
    hooks: {
      async beforeCreate(user) {
        user.password = await bcrypt.hash(user.password, 10);
      },
      async beforeUpdate(user) {
        if (user.changed('password')) {
          user.password = await bcrypt.hash(user.password, 10);
        }
      }
    }
  });

  User.prototype.validatePassword = function validatePassword(password) {
    return bcrypt.compare(password, this.password);
  };

  User.associate = (models) => {
    User.hasMany(models.Deposit, { foreignKey: 'userId' });
    User.hasMany(models.Deposit, { foreignKey: 'reviewedBy', as: 'reviewer' });
    User.hasMany(models.Order, { foreignKey: 'userId' });
    User.hasMany(models.BalanceLog, { foreignKey: 'userId' });
  };

  return User;
};
