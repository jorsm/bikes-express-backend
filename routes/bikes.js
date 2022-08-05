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
router.post("/", createBike);
router.get("/:bikeId", getBike);

router.patch("/location/:bikeId", jwtUserAuth);
router.get("/location/:bikeId", getBikeLocations);

module.exports = router;
