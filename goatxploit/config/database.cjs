require('dotenv').config();

module.exports = {
  development: {
    dialect: 'sqlite',
    storage: process.env.SQLITE_STORAGE || './dev.sqlite',
    logging: false
  },
  production: {
    use_env_variable: 'DATABASE_URL',
    dialect: 'postgres',
    protocol: 'postgres',
    dialectOptions: {
      ssl: {
        require: true,
        rejectUnauthorized: false
      }
    },
    logging: false
  }
};
