export default function initGameUserModel(sequelize, DataTypes) {
  return sequelize.define(
    'game_user',
    {
      player_number: {
        type: DataTypes.INTEGER,
      },
      score: {
        type: DataTypes.INTEGER,
      },
    },
    {
      underscored: true,
    },
  );
}
