const express = require("express");
const router = express.Router();
const {
  getBikes: getAvailableBikes,
  createBike,
  getBike,
  getBikeByCode,
  getBikeLocations,
  updateBikeLocation,
  rentBike,
  returnBike,
  lockBike,
  unlockBike,
  bookBike,
} = require("../controllers/bikes");
const { jwtUserAuth } = require("../middleware/authentication");

router.get("/", getAvailableBikes);
router.get("/:bikeId", getBike);
router.get("/code/:code", getBikeByCode);
router.get("/location/:bikeId", getBikeLocations);

router.post("/", createBike);
router.post("/rent/:code", jwtUserAuth, rentBike);
router.post("/return/:rentId", jwtUserAuth, returnBike);
router.post("/lock/:bikeId", jwtUserAuth, lockBike);
router.post("/unlock/:bikeId", jwtUserAuth, unlockBike);

router.patch("/location/:bikeId", jwtUserAuth, updateBikeLocation);

module.exports = router;
