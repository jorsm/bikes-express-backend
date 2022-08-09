const express = require("express");
const router = express.Router();
const { getStartStations, getEndStations } = require("../controllers/bikes");
const { jwtUserAuth } = require("../middleware/authentication");

router.get("/", getStartStations);
router.get("/return", jwtUserAuth, getEndStations);

module.exports = router;
