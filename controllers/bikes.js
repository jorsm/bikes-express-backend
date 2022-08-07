const passport = require("passport");
const Bike = require("../db/models/Bike");
const Location = require("../db/models/Location");
const Rent = require("../db/models/Rent");
const {
  NotFoundError,
  BadRequestError,
  UnauthorizedError,
} = require("../errors");
const errorHandlerMiddleware = require("../middleware/error-handler");
module.exports = {};

module.exports.getAllBikes = async (req, res, next) => {
  const bikes = await Bike.find({});
  res.status(200).json({ bikes });
};
module.exports.createBike = async (req, res, next) => {
  /**
   * TODO: sanitize user input
   **/
  if (!req.body.name) throw new BadRequestError("name property is required");
  const bike = await Bike.create({ name: req.body.name });
  res.status(201).json({ bike });
};

module.exports.getBike = async (req, res, next) => {
  const { bikeId } = req.params;
  const bike = await Bike.findOne({ _id: bikeId });
  if (!bike) throw new NotFoundError(`bike ${bikeId} not found`);
  const { id, name, status, conditions } = bike;
  res.status(200).json({ id, name, status, conditions });
};

module.exports.updateBikeLocation = async (req, res, next) => {
  /**
   * TODO: sanitize user input
   **/
  const { bikeId } = req.params;

  const bike = await Bike.findOne({ _id: bikeId });
  if (!bike) throw new NotFoundError(`bike ${bikeId} not found`);

  if (req.body.location) {
    var { longitude, latitude } = updateObj.location;
    longitude = Number(longitude);
    latitude = Number(latitude);
    if (!latitude || !longitude)
      throw new BadRequestError(`location provided is not valid`);

    bikeLocation = await Location.create({
      bikeId: bike._id,
      location: { type: "Point", coordinates: [longitude, latitude] },
      longitude: longitude,
    });
  }
  res.status(200).send();
};

module.exports.getBikeLocations = async (req, res, next) => {
  const { bikeId } = req.params;
  const limit = req.query.limit || 1;
  const locations = await Location.find({ bikeId })
    .sort("-timestamp")
    .limit(limit);
  if (!locations) throw new NotFoundError(`no location found for ${bikeId}`);
  var resObj = locations.map((loc) => {
    return {
      longitude: loc.location.coordinates[0],
      latitude: loc.location.coordinates[1],
      timestamp: loc.timestamp,
    };
  });
  resObj.id = bikeId;
  res.status(200).json(resObj);
};

module.exports.rentBike = async (req, res, next) => {
  /**
   * TODO: sanitize user input
   **/
  let rent = {};
  const { bikeId } = req.params;
  const { startStationId } = req.body;
  const userId = req.user.id;
  try {
    rent = new Rent().start(bikeId, userId, startStationId);
  } catch (error) {
    console.log(error);
  }

  res.status(200).json(rent);
};
module.exports.returnBike = async (req, res, next) => {};
module.exports.lockBike = async (req, res, next) => {};
module.exports.unlockBike = async (req, res, next) => {};
