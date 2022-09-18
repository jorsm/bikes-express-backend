const express = require("express");
const router = express.Router();
const {
  signIn,
  verifyOtp,
  getRent,
  getSubscription,
  createSubscriptionOrder,
  acceptSubscriptionOrder,
} = require("../controllers/users");
const { jwtUserAuth } = require("../middleware/authentication");

router.post("/sign-in/", signIn);
router.post("/verify/", verifyOtp);

router.get("/rent/", jwtUserAuth, getRent);
router.get("/subscription/", jwtUserAuth, getSubscription);
router.post("/subscription/", jwtUserAuth, createSubscriptionOrder);
router.post("/subscription/:orderID", jwtUserAuth, acceptSubscriptionOrder);

module.exports = router;
