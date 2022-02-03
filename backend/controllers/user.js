const { bcryptHash } = require("../helper/bcrypt");

//* Current User
const currentUser = async (req, res) => {
  try {
    const { loggedUser } = req;
    if (!loggedUser) throw new Error("You need to be logged in!");

    loggedUser.dataValues.email = req.headers.email;
    delete req.headers.email;

    res.json({ user: loggedUser });
  } catch (error) {
    res.json({ errors: { body: [error.message] } });
  }
};

//* Update User
const updateUser = async (req, res) => {
  try {
    const { loggedUser } = req;
    if (!loggedUser) throw new Error("You need to be logged in!");

    const { email, username, password, image, bio } = req.body.user;

    if (email) loggedUser.email = email;
    if (username) loggedUser.username = username;
    if (password) loggedUser.password = await bcryptHash(password);
    if (image) loggedUser.image = image;
    if (bio) loggedUser.bio = bio;

    await loggedUser.save();

    res.json({ user: loggedUser });
  } catch (error) {
    res.json({ errors: { body: [error.message] } });
  }
};

module.exports = { currentUser, updateUser };
