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

    const {
      user: { password },
      user,
    } = req.body;

    Object.entries(user).forEach((entry) => {
      const [key, value] = entry;

      if (value !== undefined && key !== "password") loggedUser[key] = value;
    });

    if (password !== undefined) {
      loggedUser.password = await bcryptHash(password);
    }

    await loggedUser.save();

    res.json({ user: loggedUser });
  } catch (error) {
    res.json({ errors: { body: [error.message] } });
  }
};

module.exports = { currentUser, updateUser };
