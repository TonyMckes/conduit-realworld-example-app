const { appendFollowers } = require("../helper/helpers");
const { User } = require("../models");

//? Profile
const getProfile = async (req, res) => {
  try {
    const { loggedUser } = req;
    const { username } = req.params;

    const profile = await User.findOne({
      where: { username: username },
      attributes: { exclude: "email" },
    });
    if (!profile) throw new Error("User profile doesn't exists");

    await appendFollowers(loggedUser, profile);

    res.json({ profile });
  } catch (error) {
    res.json({ errors: { body: [error.message] } });
  }
};

//* Follow/Unfollow Profile
const followToggler = async (req, res) => {
  try {
    const { loggedUser } = req;
    if (!loggedUser) throw new Error("You need to login first!");

    const { username } = req.params;

    const profile = await User.findOne({
      where: { username: username },
      attributes: { exclude: "email" },
    });
    if (!profile) throw new Error("User profile doesn't exists");

    if (req.method === "POST") {
      await profile.addFollower(loggedUser);
    } else if (req.method === "DELETE") {
      await profile.removeFollower(loggedUser);
    }

    await appendFollowers(loggedUser, profile);

    res.json({ profile });
  } catch (error) {
    res.json({ errors: { body: [error.message] } });
  }
};

module.exports = { getProfile, followToggler };
