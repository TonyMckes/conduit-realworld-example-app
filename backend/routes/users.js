const express = require("express");
const router = express.Router();
const { User } = require("../models");
const { jwtSign } = require("../helper/jwt");
const { bcryptHash, bcryptCompare } = require("../helper/bcrypt");

// Register
router.post("/", async (req, res) => {
  try {
    const { user } = req.body;

    // const userExists = await User.findOne({ where: { email: user.email } });
    // if (userExists) throw new Error("Email already exists! try logging in");

    const hashPwd = await bcryptHash(user.password);

    const newUser = await User.create({
      email: user.email,
      username: user.username,
      bio: user.bio,
      image: user.image,
      password: hashPwd,
    });

    newUser.dataValues.token = await jwtSign(newUser);

    res.json({ user: newUser });
  } catch (error) {
    res.json({ errors: { body: error.message } });
  }
});

// Login
router.post("/login", async (req, res) => {
  try {
    const { user } = req.body;

    const existentUser = await User.findOne({ where: { email: user.email } });
    if (!existentUser) throw new Error("Email doesn't exist! sign in first");

    const pwd = await bcryptCompare(user.password, existentUser.password);
    if (!pwd) throw new Error("Password doesn't match!");

    existentUser.dataValues.token = await jwtSign(user);

    res.json({ user: existentUser });
  } catch (error) {
    res.json({ errors: { body: error.message } });
  }
});

module.exports = router;
