const Bike = require("../db/models/Bike");
const Location = require("../db/models/Location");
const Rent = require("../db/models/Rent");
const { NotFoundError, BadRequestError } = require("../errors");
const { StatusCodes } = require("http-status-codes");
const { MAX_RENTS_PER_DAY } = require("../utils/configs");

module.exports = {};

module.exports.getBikes = async (req, res) => {
  if (!req.body.ids) {
    throw new BadRequestError("ids are required");
  }
  const ids = req.body.ids;
  const bikes = await Bike.find({ id: { $in: ids }, status: "available" });
  res.status(StatusCodes.OK).json({ bikes });
};

module.exports.createBike = async (req, res) => {
  const bike = await Bike.create({});
  if (!bike) throw new Error("unable  to create bike");
  let alreadyUsed, code;
  do {
    code = Math.floor(Math.random() * 1000000);
    alreadyUsed = await Bike.findOne({ code });
  } while (alreadyUsed);
  bike.code = code;
  await bike.save();
  res.status(StatusCodes.CREATED).json({ bike });
};

module.exports.getBike = async (req, res) => {
  const { bikeId } = req.params;
  const bike = await Bike.findOne({ _id: bikeId });
  if (!bike) throw new NotFoundError("bike not found");
  res.status(StatusCodes.OK).json(bike);
};

module.exports.getBikeByCode = async (req, res) => {
  const { code } = req.params;
  const bike = await Bike.findOne({ code });
  if (!bike) throw new NotFoundError("bike not found");
  res.status(StatusCodes.OK).json(bike);
};

module.exports.updateBikeLocation = async (req, res) => {
  /**
   * TODO: sanitize user input
   **/
  const { bikeId } = req.params;

  const bike = await Bike.findOne({ _id: bikeId });
  if (!bike) throw new NotFoundError("bike not found");

  if (req.body.location) {
    var { longitude, latitude } = req.body.location;
    longitude = Number(longitude);
    latitude = Number(latitude);
    if (!latitude || !longitude)
      throw new BadRequestError("location provided is not valid");

    bikeLocation = await Location.create({
      bikeId: bike._id,
      location: { type: "Point", coordinates: [longitude, latitude] },
      longitude: longitude,
    });
    if (!bikeLocation)
      throw new Error("unable to set location, please try later");
    res.status(StatusCodes.CREATED).send();
  }
};

module.exports.getBikeLocations = async (req, res) => {
  const { bikeId } = req.params;
  const limit = req.query.limit || 1;
  const locations = await Location.find({ bikeId })
    .sort("-timestamp")
    .limit(limit);
  if (!locations) throw new NotFoundError("no location found for this bike");
  var resObj = locations.map((loc) => {
    return {
      longitude: loc.location.coordinates[0],
      latitude: loc.location.coordinates[1],
      timestamp: loc.timestamp,
    };
  });
  resObj.id = bikeId;
  res.status(StatusCodes.OK).json(resObj);
};

module.exports.rentBike = async (req, res) => {
  /**
   * TODO: sanitize user input
   **/
  const alreadyOnRent = await Rent.countDocuments({
    userId: req.user.id,
    endedAt: null,
  });
  if (alreadyOnRent)
    throw new BadRequestError("only one bike can be booked at a time");

  var midnight = new Date().setHours(0, 0, 0, 0);
  const todayRents = await Rent.countDocuments({
    userId: req.user.id,
    startedAt: { $gte: midnight },
  });

  if (todayRents >= maxRents)
    throw new BadRequestError(
      "cannot rent more than " + MAX_RENTS_PER_DAY + "per day"
    );
  //ToDo: manage on frontend?

  const { bikeId } = req.params;
  const { startStationId } = req.body;
  const userId = req.user.id;
  const { rent, bike, station } = await new Rent().startRent(
    bikeId,
    userId,
    startStationId
  );
  //ToDo: check valid payment status and if first_rent
  bike.startRent();
  station.startRent(bikeId);
  res.status(StatusCodes.CREATED).json({ id: rent.id });
};
module.exports.returnBike = async (req, res) => {
  /**
   * ToDo: sanitize user input
   */
  /**
   * Returning multiple times does not throw any error right now
   *  so if there is an unexpected client or mqtt error while returning the bike,
   *  the function can be simply called again
   * ToDO: any Downdides?
   */
  const { bikeId } = req.params;
  const { endStationId, rentId } = req.body;
  const userId = req.user.id;

  let rent = await Rent.findById(rentId);
  if (!rent) throw new BadRequestError("rentId is not valid");
  let { bike, station } = await rent.endRent(bikeId, userId, endStationId);
  if (!bike) throw new BadRequestError("bikeId is not valid");
  if (!station) throw new BadRequestError("stationId is not valid");

  //ToDo: add burn calories, CO2 saved n' stuff
  let jsonRes = {};
  if (!bike.status === "rented")
    jsonRes = {
      warning: "bike already returned",
    };
  else {
    bike.endRent();
    station.endRent(bikeId);
  }
  res.status(StatusCodes.OK).json(jsonRes);
};
module.exports.lockBike = async (req, res) => {};
module.exports.unlockBike = async (req, res) => {};
module.exports.bookBike = async (req, res) => {};
