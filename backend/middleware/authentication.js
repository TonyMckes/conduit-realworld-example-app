const { jwtVerify } = require("../helper/jwt");
const { User } = require("../models");

const verifyToken = async (req, res, next) => {
  try {
    const { headers } = req;

    if (headers.authorization) {
      const token = headers.authorization.split(" ")[1];

      let loggedUser = await jwtVerify(token);
      if (!loggedUser) throw new Error("Invalid Token");

      req.loggedUser = await User.findOne({
        attributes: { exclude: ["email"] },
        where: { email: loggedUser.email },
      });

      headers.email = loggedUser.email;
      req.loggedUser.dataValues.token = token;
    }

    next();
  } catch (error) {
    res.json({ errors: { body: error.message } });
  }
};

module.exports = verifyToken;
