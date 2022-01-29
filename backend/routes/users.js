const express = require("express");
const router = express.Router();
const { User } = require("../models");
const { jwtSign } = require("../helper/jwt");
const { bcryptHash } = require("../helper/bcrypt");

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



module.exports = router;
