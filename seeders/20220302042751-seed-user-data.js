const jsSHA = require('jssha');

const getHash = (input) => {
  const shaObj = new jsSHA('SHA-512', 'TEXT', { encoding: 'UTF8' });
  shaObj.update(input);
  return shaObj.getHash('HEX');
};

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.bulkInsert('users', [{
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
    }]);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('users', null);
  },
};
