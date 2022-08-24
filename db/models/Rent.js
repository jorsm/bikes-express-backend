const { required } = require("joi");
const mongoose = require("mongoose");
const { BadRequestError } = require("../../errors");
const errorHandlerMiddleware = require("../../middleware/error-handler");
const Bike = require("./Bike");
const User = require("./User");
const Station = require("./Station");

const RentSchema = new mongoose.Schema({
  bikeId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Bike",
    required: [true, "must provide bike ID"],
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: [true, "must provide user ID"],
  },
  startStationId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Station",
    required: [true, "must start station ID"],
  },
  endStationId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Station",
  },
  startedAt: { type: Date, default: null },
  endedAt: { type: Date, default: null },
});

RentSchema.methods.startRent = async function (bikeId, userId, startStationId) {
  let checks = [
    Bike.findById(bikeId).exec(),
    User.findById(userId).exec(),
    Station.findOne({ bikes: bikeId }).exec(),
  ];

  return await Promise.all(checks)
    .then(async ([bike, user, station]) => {
      if (!bike || bike.status != "available")
        throw new BadRequestError("bike not available for rent");
      if (!user) throw new BadRequestError("user not found");
      if (!station) throw new BadRequestError("station not available");
      if (!station.bikes.includes(bikeId))
        throw new BadRequestError("bike not parked here");
      try {
        this.bikeId = bikeId;
        this.userId = userId;
        this.startStationId = startStationId;
        this.startedAt = Date.now();
        const rent = await this.save();
        return { rent, bike, station };
      } catch (error) {
        throw error;
      }
    })
    .catch((error) => {
      throw error;
    });
};

RentSchema.methods.endRent = async function (bikeId, userId, endStationId) {
  if (bikeId !== this.bikeId.toString())
    throw new BadRequestError("can not end this rent fot this bike");
  if (userId !== this.userId.toString())
    throw new BadRequestError("can not end this rent fot this user");
  this.endStationId = endStationId;
  this.endedAt = Date.now();

  const endStation = await Station.findById(endStationId);
  if (!endStation) throw new BadRequestError("station not available");
  stationFull =
    endStation.capacity - endStation.bikes.length > 0 ? false : true;
  if (stationFull)
    throw new BadRequestError("station full,  can not end rent here");
  let checks = [
    this.save(),
    Bike.findById(bikeId).exec(),
    User.findById(userId).exec(),
  ];
  return await Promise.all(checks).then(([rent, bike]) => {
    return { rent, bike, station: endStation };
  });
};
module.exports = mongoose.model("Rent", RentSchema);
