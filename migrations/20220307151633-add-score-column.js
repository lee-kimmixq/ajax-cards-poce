module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('games_users', 'player_number', { type: Sequelize.INTEGER });
    await queryInterface.addColumn('games_users', 'score', { type: Sequelize.INTEGER });

    await queryInterface.sequelize.query('UPDATE games_users SET player_number = 1 WHERE user_id = 1');
    await queryInterface.sequelize.query('UPDATE games_users SET player_number = 2 WHERE user_id = 2');
    await queryInterface.sequelize.query('UPDATE games_users SET score = 0');
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn('games_users', 'player_number');
    await queryInterface.removeColumn('games_users', 'score');
  },
};
