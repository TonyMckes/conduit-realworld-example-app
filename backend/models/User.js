"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class User extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate({ Article, Comment, User }) {
      // define association here

      // Articles
      this.hasMany(Article, { foreignKey: "userId", onDelete: "CASCADE" });

      // Comments
      // this.hasMany(Comment, { foreignKey: "userId" });
      this.belongsToMany(Article, {
        through: Comment,
        as: "comment",
        foreignKey: "userId",
      });

      // Favorites
      this.belongsToMany(Article, {
        through: "Favorites",
        as: "favorites",
        foreignKey: "userId",
        timestamps: false,
      });

      // Followers
      this.belongsToMany(User, {
        through: "Followers",
        as: "followers",
        timestamps: false,
      });
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
