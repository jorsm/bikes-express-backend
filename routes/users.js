const express = require("express");
const router = express.Router();
const {
  emailLogin,
  googleLoginRequest,
  googleLoginResponse,
  facebookLoginRequest,
  facebookLoginResponse,
} = require("../controllers/users");

router.post("/login/email", emailLogin);

router.get("/login/google", googleLoginRequest);
router.get("/auth/google", googleLoginResponse);
router.get("/login/facebook", facebookLoginRequest);
router.get("/auth/facebook", facebookLoginResponse);

module.exports = router;
