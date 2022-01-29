const { jwtVerify } = require("../helper/jwt");

const verifyToken = async (req, res, next) => {
  try {
    const headers = req.headers;
    if (!headers.authorization) throw new Error("You need to login first");

    const token = headers.authorization.split(" ")[1];

    const validToken = await jwtVerify(token);
    if (!validToken) throw new Error("Invalid Token");

    req.user = validToken;
    req.user.token = token;

    next();
  } catch (error) {
    res.json({ errors: error.message });
  }
};

module.exports = verifyToken;
