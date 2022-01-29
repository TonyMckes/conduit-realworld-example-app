const jwt = require("jsonwebtoken");
const privateKey = "superSecret"; //! Temporary key

module.exports.jwtSign = async (payload) => {
  return jwt.sign(
    { username: payload.username, email: payload.email },
    privateKey,
  );
};

// module.exports.jwtSign = (payload) => {
//   try {
//     return jwt.sign(
//       { username: payload.username, email: payload.email },
//       privateKey,
//     );
//   } catch (error) {
//     console.log(`Error signing JWT: ${error}`);
//   }
// };

// module.exports.jwtVerify = async (token) => {
//   try {
//     return jwt.verify(token, privateKey);
//   } catch (error) {
//     console.log(`Error decoding JWT: ${error}`);
//   }
// };

module.exports.jwtVerify = async (token) => {
  return jwt.verify(token, privateKey);
};
