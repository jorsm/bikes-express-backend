const express = require("express");
const router = express.Router();
const {
  signIn,
  verifyOtp,
  getActiveRent,
  paypalHandler,
} = require("../controllers/users");
const { jwtUserAuth } = require("../middleware/authentication");

router.post("/sign-in/", signIn);
router.post("/verify/", verifyOtp);
router.post("/paypal/", paypalHandler);
router.get("/active-rent/", jwtUserAuth, getActiveRent);

module.exports = router;
