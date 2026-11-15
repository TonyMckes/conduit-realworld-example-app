"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  /**
   * An article update that was rejected because the article had been changed
   * from another editor since the submitting editor loaded it. The submitted
   * content is kept here, instead of being dropped or overwriting the saved
   * article, until the author appends/merges/overwrites it or discards it.
   */
  class UnsavedEdit extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate({ Article }) {
      // define association here

      // Article
      this.belongsTo(Article, { foreignKey: "articleId" });
    }

    toJSON() {
      const { baseTitle, baseDescription, baseBody, baseTagList, ...unsavedEdit } =
        this.get();
      const hasBase = [baseTitle, baseDescription, baseBody, baseTagList].some(
        (field) => field !== null && field !== undefined,
      );

      return {
        ...unsavedEdit,
        // What the article looked like in the editor the edit was made in,
        // which allows a three-way merge with the last saved version.
        base: hasBase
          ? {
              title: baseTitle,
              description: baseDescription,
              body: baseBody,
              tagList: baseTagList,
            }
          : null,
        articleId: undefined,
        updatedAt: undefined,
      };
    }
  }

  // A list of tag names, kept as JSON text so it works with every dialect
  const tagListType = (field) => ({
    type: DataTypes.TEXT,
    get() {
      const json = this.getDataValue(field);

      return json ? JSON.parse(json) : null;
    },
    set(tagList) {
      this.setDataValue(
        field,
        Array.isArray(tagList) ? JSON.stringify(tagList) : null,
      );
    },
  });

  UnsavedEdit.init(
    {
      // Everything an article update can change; null when it was left out.
      // TEXT rather than STRING so a rejected submission can always be kept.
      title: DataTypes.TEXT,
      description: DataTypes.TEXT,
      body: DataTypes.TEXT,
      tagList: tagListType("tagList"),
      // Article version the edit was based on
      baseVersion: DataTypes.INTEGER,
      baseTitle: DataTypes.TEXT,
      baseDescription: DataTypes.TEXT,
      baseBody: DataTypes.TEXT,
      baseTagList: tagListType("baseTagList"),
    },
    {
      sequelize,
      modelName: "UnsavedEdit",
    },
  );
  return UnsavedEdit;
};
