import sequelizePackage from 'sequelize';
import allConfig from '../config/config.js';

import initUserModel from './user.mjs';
import initGameModel from './game.mjs';
import initGameUserModel from './gameUser.mjs';

const { Sequelize } = sequelizePackage;
const env = process.env.NODE_ENV || 'development';
const config = allConfig[env];
const db = {};

const sequelize = new Sequelize(
  config.database,
  config.username,
  config.password,
  config,
);

db.User = initUserModel(sequelize, Sequelize.DataTypes);
db.Game = initGameModel(sequelize, Sequelize.DataTypes);
db.GameUser = initGameUserModel(sequelize, Sequelize.DataTypes);

db.User.belongsToMany(db.Game, { through: 'games_users' });
db.Game.belongsToMany(db.User, { through: 'games_users' });

// db.User.hasMany(db.GameUser);
// db.GameUser.belongsTo(db.User);
// db.Game.hasMany(db.GameUser);
// db.GameUser.belongsTo(db.Game);

db.sequelize = sequelize;
db.Sequelize = Sequelize;

export default db;
