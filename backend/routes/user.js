const express = require("express");
const router = express.Router();

// Current User
router.get("/", async (req, res) => {
  try {
    const { loggedUser } = req;
    if (!loggedUser) throw new Error("You need to be logged in!");

    loggedUser.dataValues.email = req.headers.email;
    delete req.headers.email;

    res.json({ user: loggedUser });
  } catch (error) {
    res.json({ errors: { body: error.message } });
  }
});

// Update User
router.put("/", async (req, res) => {
  try {
    const { loggedUser } = req;
    if (!loggedUser) throw new Error("You need to be logged in!");

    loggedUser.email = req.body.user.email;
    await loggedUser.save();

    res.json({ user: loggedUser });
  } catch (error) {
    res.json({ errors: { body: error.message } });
  }
});

module.exports = router;
