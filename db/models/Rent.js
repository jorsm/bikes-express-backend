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

RentSchema.methods.startRent = async function (bikeCode, userId) {
  let checks = [
    Bike.findOne({ code: bikeCode, status: "available" }).exec(),
    Station.findOne({ bikes: bikeCode }).exec(),
  ];

  return await Promise.all(checks)
    .then(async ([bike, station]) => {
      if (!bike) throw new BadRequestError("bike not available for rent");
      if (!station) throw new BadRequestError("bike not parked here");

      try {
        this.bikeId = bike.id;
        this.userId = userId;
        this.startStationId = station.id;
        this.startedAt = Date.now();
        const rent = await this.save();
        bike.startRent();
        station.startRent(bikeCode);
        return { rent, bike, station };
      } catch (error) {
        throw error;
      }
    })
    .catch((error) => {
      throw error;
    });
};

RentSchema.methods.endRent = async function (endStation) {
  if (endStation.isFull)
    throw new BadRequestError("station full,  can not end rent here");
  try {
    this.endStationId = endStation.id;
    this.endedAt = Date.now();

    this.save();
    const bike = await Bike.findById(this.bikeId);
    if (bike) bike.endRent();
    endStation.endRent(this.bikeId);
  } catch (error) {
    throw error;
  }
};
module.exports = mongoose.model("Rent", RentSchema);
