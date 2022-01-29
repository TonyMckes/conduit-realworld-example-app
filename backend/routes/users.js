const express = require("express");
const router = express.Router();
const { User } = require("../models");
const { jwtSign, jwtVerify } = require("../helper/jwt");
const { bcryptHash, bcryptCompare } = require("../helper/bcrypt");

router.post("/", async (req, res) => {
  try {
    const data = req.body.user;

    // const userExists = await User.findOne({ where: { email: data.email } });
    // if (userExists) throw new Error("Email already exists! try logging in");

    const hashPwd = await bcryptHash(data.password);

    const user = await User.create({
      email: data.email,
      username: data.username,
      bio: data.bio,
      image: data.image,
      password: hashPwd,
    });

    user.dataValues.token = await jwtSign(user);

    res.json({ user });
  } catch (error) {
    res.json({ errors: error.message });
  }
});

router.post("/login", async (req, res) => {
  try {
    const data = req.body.user;

    const user = await User.findOne({ where: { email: data.email } });
    if (!user) throw new Error("Email doesn't exist! sign in first");

    const pwd = await bcryptCompare(req.body.user.password, user.password);
    if (!pwd) throw new Error("Password doesn't match!");

    //? Global variable token || Login and Remember Token
    user.dataValues.token = await jwtSign(user);

    res.json({ user });
  } catch (error) {
    res.json({ errors: error.message });
  }
});

module.exports = router;
