const express = require("express");
const router = express.Router();
const { signUp, signIn } = require("../controllers/users");

// Register
router.post("/", signUp);
// Login
router.post("/login", signIn);

module.exports = router;
