const jwt = require("jsonwebtoken");
const privateKey =
  process.env.JWT_KEY ||
  (process.env.NODE_ENV === "production" ? undefined : "conduit-dev-jwt-key");

module.exports.jwtSign = async (payload) => {
  return jwt.sign(
    { username: payload.username, email: payload.email },
    privateKey,
  );
};

module.exports.jwtVerify = async (token) => {
  return jwt.verify(token, privateKey);
};
