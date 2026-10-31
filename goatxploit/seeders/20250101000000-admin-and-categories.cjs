'use strict';

const bcrypt = require('bcrypt');

module.exports = {
  async up(queryInterface) {
    const now = new Date();
    const adminPassword = await bcrypt.hash(process.env.ADMIN_PASSWORD || 'Admin123!', 10);

    await queryInterface.bulkInsert('Users', [{
      username: 'goatxploit-admin',
      email: process.env.ADMIN_EMAIL || 'admin@goatxploit.com',
      password: adminPassword,
      role: 'admin',
      balance: 0,
      createdAt: now,
      updatedAt: now
    }], {});

    await queryInterface.bulkInsert('Categories', [
      { name: 'Tools', slug: 'tools', createdAt: now, updatedAt: now },
      { name: 'Templates', slug: 'templates', createdAt: now, updatedAt: now },
      { name: 'Accounts', slug: 'accounts', createdAt: now, updatedAt: now }
    ], {});
  },

  async down(queryInterface) {
    await queryInterface.bulkDelete('Categories', null, {});
    await queryInterface.bulkDelete('Users', { email: process.env.ADMIN_EMAIL || 'admin@goatxploit.com' }, {});
  }
};
