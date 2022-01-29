const express = require("express");
const router = express.Router();
const { User } = require("../models");

router.get("/", async (req, res) => {
  try {
    const data = req.user;

    const user = await User.findOne({ where: { email: data.email } });
    if (!user) throw new Error("User doesn't exist!");

    user.dataValues.token = req.headers.authorization;

    res.json({ user });
  } catch (error) {
    res.json({ errors: error.message });
  }
});

router.put("/", async (req, res) => {
  try {
    const data = req.user;

    const user = await User.findOne({ where: { email: data.email } });
    if (!user) throw new Error("User doesn't exist!");

    user.email = req.body.user.email;

    await user.save();

    user.dataValues.token = req.headers.authorization;

    res.json({ user });
  } catch (error) {
    res.json({ errors: error.message });
  }
});

module.exports = router;
