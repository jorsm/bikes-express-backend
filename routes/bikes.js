const express = require("express");
const router = express.Router();
const {
  getAllBikes,
  createBike,
  getBike,
  getBikeLocations,
  updateBikeLocation,
  rentBike,
  returnBike,
  lockBike,
  unlockBike,
} = require("../controllers/bikes");
const { jwtUserAuth } = require("../middleware/authentication");

router.get("/", getAllBikes);
router.get("/:bikeId", getBike);
router.get("/location/:bikeId", getBikeLocations);

router.post("/rent/:bikeId", jwtUserAuth, rentBike);
router.post("/return/:bikeId", jwtUserAuth, returnBike);
router.post("/lock/:bikeId", jwtUserAuth, lockBike);
router.post("/unlock/:bikeId", jwtUserAuth, unlockBike);
router.post("/", createBike);

router.patch("/location/:bikeId", jwtUserAuth, updateBikeLocation);

module.exports = router;
