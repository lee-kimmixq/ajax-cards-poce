const jsSHA = require('jssha');

const getHash = (input) => {
  const hashObj = new jsSHA('SHA-512', 'TEXT', { encoding: 'UTF8' });
  hashObj.update(input);
  return hashObj.getHash('HEX');
};

module.exports = {
  async up (queryInterface, Sequelize) {
    const usersList = [
      {
        email: 'user1@test.com',
        password: getHash('user1'),
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        email: 'user2@test.com',
        password: getHash('user2'),
        created_at: new Date(),
        updated_at: new Date(),
      },
    ];
    await queryInterface.bulkInsert('users', usersList);
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.bulkDelete('users', null);
  }
};
