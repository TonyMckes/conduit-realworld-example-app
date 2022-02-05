const { User } = require("../models");
const { jwtSign } = require("../helper/jwt");
const { bcryptHash, bcryptCompare } = require("../helper/bcrypt");

// Register
const signUp = async (req, res) => {
  try {
    const userExists = await User.findOne({ where: { email: user.email } });
    if (userExists) throw new Error("Email already exists! try logging in");

    const { email, username, bio, image, password } = req.body.user;
    if (!email) throw new Error(`An email is required`);
    if (!username) throw new Error(`A username is required`);
    if (!password) throw new Error(`A password is required`);

    const newUser = await User.create({
      email: email,
      username: username,
      bio: bio,
      image: image,
      password: await bcryptHash(password),
    });

    newUser.dataValues.token = await jwtSign(newUser);

    res.json({ user: newUser });
  } catch (error) {
    res.json({ errors: { body: [error.message] } });
  }
};

// Login
const signIn = async (req, res) => {
  try {
    const { user } = req.body;

    const existentUser = await User.findOne({ where: { email: user.email } });
    if (!existentUser) throw new Error("Email doesn't exist! sign in first");

    const pwd = await bcryptCompare(user.password, existentUser.password);
    if (!pwd) throw new Error("Password doesn't match!");

    existentUser.dataValues.token = await jwtSign(user);

    res.json({ user: existentUser });
  } catch (error) {
    res.status(422).json({ errors: { body: [error.message] } });
  }
};

module.exports = { signUp, signIn };
