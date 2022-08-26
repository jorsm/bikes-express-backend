const Bike = require("../db/models/Bike");
const Location = require("../db/models/Location");
const Rent = require("../db/models/Rent");
const { NotFoundError, BadRequestError } = require("../errors");
const { StatusCodes } = require("http-status-codes");
const {
  configs: {
    MAX_RENTS_PER_DAY,
    DEFAULT_LATITUDE,
    DEFAULT_LONGITUDE,
    DEFAULT_SEARCH_RADIUS,
  },
} = require("../utils/configs");
const { getNewBikeCode } = require("../utils");
const Station = require("../db/models/Station");

module.exports = {};

module.exports.getBikes = async (req, res) => {
  if (!req.body.ids) {
    throw new BadRequestError("one or more ids are required");
  }
  const ids = req.body.ids;
  const bikes = await Bike.find({ id: { $in: ids }, status: "available" });
  res.status(StatusCodes.OK).json({ bikes });
};

module.exports.createBike = async (req, res) => {
  const bike = await Bike.create({});
  if (!bike) throw new Error("unable  to create bike");

  bike.code = getNewBikeCode();
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
  res.status(StatusCodes.OK).json({ bikeId: bike.id });
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

  if (todayRents >= MAX_RENTS_PER_DAY)
    throw new BadRequestError(
      "cannot rent more than " + MAX_RENTS_PER_DAY + "per day"
    );
  //ToDo: manage on frontend?

  const { code } = req.params;
  const userId = req.user.id;
  //ToDo: check valid payment status and if first_rent
  const { rent, bike, station } = await new Rent().startRent(code, userId);

  res.status(StatusCodes.CREATED).json({ rentId: rent.id });
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
  const { rentId } = req.params;

  const longitude = DEFAULT_LONGITUDE;
  const latitude = DEFAULT_LATITUDE;
  const radius = DEFAULT_SEARCH_RADIUS;
  const endStation = await Station.findOne({
    location: {
      $near: {
        $geometry: { type: "Point", coordinates: [longitude, latitude] },
        $maxDistance: radius,
      },
    },
  });

  let rent = await Rent.findById(rentId, req.user.id);
  if (!rent) throw new BadRequestError("rentId is not valid");
  await rent.endRent(endStation);

  res.status(StatusCodes.OK).end();
};
module.exports.lockBike = async (req, res) => {};
module.exports.unlockBike = async (req, res) => {};
module.exports.bookBike = async (req, res) => {};
