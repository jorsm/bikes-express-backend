const express = require("express");
const router = express.Router();
const {
  getAllBikes,
  createBike,
  getBike,
  getBikeLocations,
  updateBikeLocation,
} = require("../controllers/bikes");
const { jwtUserAuth } = require("../middleware/authentication");

router.get("/", getAllBikes);
router.get("/:bikeId", getBike);
router.get("/location/:bikeId", getBikeLocations);

router.post("/", createBike);

router.patch("/location/:bikeId", jwtUserAuth, updateBikeLocation);

module.exports = router;
