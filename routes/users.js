const express = require("express");
const { verify } = require("jsonwebtoken");
const router = express.Router();
const { signIn, verifyOtp } = require("../controllers/users");

router.post("/sign-in/", signIn);
router.post("/verify/", verifyOtp);

module.exports = router;
