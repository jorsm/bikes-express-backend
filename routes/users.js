const express = require("express");
const router = express.Router();
const {
  signIn,
  verifyOtp,
  getRent,
  paypalHandler,
  getSubscription,
} = require("../controllers/users");
const { jwtUserAuth } = require("../middleware/authentication");

router.post("/sign-in/", signIn);
router.post("/verify/", verifyOtp);
router.post("/paypal/", paypalHandler);
router.get("/rent/", jwtUserAuth, getRent);
router.get("/subscription/", jwtUserAuth, getSubscription);

module.exports = router;
