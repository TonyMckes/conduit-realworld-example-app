const express = require("express");
const router = express.Router();
const { Tag } = require("../models");
const { appendTagList } = require("../helper/helpers");

// All Tags
router.get("/", async (req, res) => {
  try {
    const tagList = await Tag.findAll();

    const tags = appendTagList(tagList);

    res.json({ tags });
  } catch (error) {
    res.json({ errors: { body: [error.message] } });
  }
});

module.exports = router;
