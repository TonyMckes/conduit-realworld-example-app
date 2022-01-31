"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class User extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate({ Article, Comment }) {
      // define association here
      this.hasMany(Article, { foreignKey: "userId", onDelete: "CASCADE" });
      // this.hasMany(Comment, { foreignKey: "userId" });
    }

    toJSON() {
      return {
        ...this.get(),
        id: undefined,
        password: undefined,
        updatedAt: undefined,
        createdAt: undefined,
      };
    }
  }
  User.init(
    {
      email: DataTypes.STRING,
      username: DataTypes.STRING,
      bio: {
        type: DataTypes.TEXT,
        defaultValue: null,
      },
      image: {
        type: DataTypes.TEXT,
        defaultValue: null,
      },
      password: DataTypes.STRING,
    },
    {
      sequelize,
      modelName: "User",
    },
  );
  return User;
};
