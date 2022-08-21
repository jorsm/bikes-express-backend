const express = require("express");
const router = express.Router();
const { signIn } = require("../controllers/users");

router.post("/sign-in/", signIn);

module.exports = router;
