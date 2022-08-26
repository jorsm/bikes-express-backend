const express = require("express");
const router = express.Router();
const { signIn, verifyOtp, getActiveRent } = require("../controllers/users");
const { jwtUserAuth } = require("../middleware/authentication");

router.post("/sign-in/", signIn);
router.post("/verify/", verifyOtp);
router.get("/active-rent/", jwtUserAuth, getActiveRent);

module.exports = router;
