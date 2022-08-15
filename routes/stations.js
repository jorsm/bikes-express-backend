const express = require("express");
const router = express.Router();
const { getStartStations, getEndStations } = require("../controllers/stations");
const { jwtUserAuth } = require("../middleware/authentication");

router.post("/", getStartStations);
router.post("/return", jwtUserAuth, getEndStations);

module.exports = router;
