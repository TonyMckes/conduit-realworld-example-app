const express = require("express");
const router = express.Router();
const { sequelize } = require("../models");

// Reset database
router.get("/", async (req, res, next) => {
  console.log("Clearing database");
  sequelize.sync({ force: true });
  res.json({ message: "Database has been cleared for testing" });
});

module.exports = router;
