const { jwtVerify } = require("../helper/jwt");
const { User } = require("../models");

const verifyToken = async (req, res, next) => {
  try {
    const { headers } = req;

    if (headers.authorization) {
      const token = headers.authorization.split(" ")[1];
      if (!token) throw new Error("You need to log in first!");

      const userVerified = await jwtVerify(token);
      if (!userVerified) throw new Error("Invalid Token");

      req.loggedUser = await User.findOne({
        attributes: { exclude: ["email"] },
        where: { email: userVerified.email },
      });

      if (req.loggedUser) {
        headers.email = userVerified.email;
        req.loggedUser.dataValues.token = token;
      }
    }

    next();
  } catch (error) {
    res.json({ errors: { body: [error.message] } });
  }
};

module.exports = verifyToken;
