"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class Article extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate({ User, Tag, Comment, UnsavedEdit }) {
      // define association here

      // Users
      this.belongsTo(User, { foreignKey: "userId", as: "author" });

      // Comments
      this.hasMany(Comment, { foreignKey: "articleId", onDelete: "cascade" });

      // Edits rejected because of a concurrent update (see UnsavedEdit)
      this.hasMany(UnsavedEdit, {
        foreignKey: "articleId",
        onDelete: "cascade",
      });

      // Tag list
      this.belongsToMany(Tag, {
        through: "TagList",
        as: "tagList",
        foreignKey: "articleId",
        timestamps: false,
        onDelete: "cascade", // FIXME: delete tags
      });

      // Favorites
      this.belongsToMany(User, {
        through: "Favorites",
        foreignKey: "articleId",
        timestamps: false,
      });
    }

    toJSON() {
      // `id` is exposed so an editor can still address the article after its
      // slug was changed (title edited) from another editor.
      return {
        ...this.get(),
        userId: undefined,
      };
    }
  }
  Article.init(
    {
      slug: DataTypes.STRING,
      title: DataTypes.STRING,
      description: DataTypes.TEXT,
      body: DataTypes.TEXT,
    },
    {
      sequelize,
      modelName: "Article",
      // Optimistic locking: adds an integer `version` column that is
      // incremented on every save, and makes `save()` throw an
      // OptimisticLockError when the row was changed since it was read.
      version: true,
    },
  );
  return Article;
};
