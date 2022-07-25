const express = require("express");
const router = express.Router();
const { Tag } = require("../models");
const { appendTagList } = require("../helper/helpers");

// All Tags
router.get("/", async (req, res, next) => {
  try {
    const tagList = await Tag.findAll();

    const tags = appendTagList(tagList);

    res.json({ tags });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
