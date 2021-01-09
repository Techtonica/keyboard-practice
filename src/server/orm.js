const Sequelize = require("sequelize");
const { DB_URL } = require("./config.js");

const sequelize = new Sequelize(DB_URL);

// define basic model for a user
const Model = Sequelize.Model;
class User extends Model {}
User.init(
  {
    last_login: {
      type: Sequelize.DATE,
      defaultValue: Sequelize.NOW,
    },
    id: {
      type: Sequelize.STRING,
      primaryKey: true,
    },
  },
  {
    sequelize,
    modelName: "user",
    createdAt: "created_at",
    updatedAt: "updated_at",
  }
);
class UserAnswers extends Model {}
UserAnswers.init(
  {
    user_id: {
      type: Sequelize.STRING,
      allowNull: false,
    },
    question_number: {
      type: Sequelize.INTEGER,
      allowNull: false,
    },
    is_correct: {
      type: Sequelize.BOOLEAN,
      allowNull: false,
    },
    elapsed_time_ms: {
      type: Sequelize.INTEGER,
      allowNull: false,
    },
  },
  {
    sequelize,
    modelName: "user_answers",
    createdAt: 'created_at',
    updatedAt: false,
    indexes: [
      {
        fields: ['created_at', 'user_id', 'question_number']
      },
      {
        fields: ['created_at', 'user_id']
      }
    ]
  }
);
User.hasMany(UserAnswers, { foreignKey: "user_id" });
UserAnswers.belongsTo(User, { foreignKey: "user_id" });
const connectToDb = async () => {
  await sequelize.authenticate();
  await sequelize.sync();
};

module.exports = {
  User,
  connectToDb,
  UserAnswers,
  sequelize,
};
