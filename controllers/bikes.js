const Bike = require("../db/models/Bike");
const Location = require("../db/models/Location");
const Rent = require("../db/models/Rent");
const { NotFoundError, BadRequestError } = require("../errors");
const errorHandlerMiddleware = require("../middleware/error-handler");
const { StatusCodes } = require("http-status-codes");
module.exports = {};

module.exports.getAllBikes = async (req, res, next) => {
  const bikes = await Bike.find({});
  res.status(StatusCodes.OK).json({ bikes });
};
module.exports.createBike = async (req, res, next) => {
  /**
   * TODO: sanitize user input
   **/

  if (!req.body.name) throw new BadRequestError("name property is required");
  const bike = await Bike.create({ name: req.body.name });
  res.status(StatusCodes.CREATED).json({ bike });
};

module.exports.getBike = async (req, res, next) => {
  const { bikeId } = req.params;
  const bike = await Bike.findOne({ _id: bikeId });
  if (!bike) throw new NotFoundError(`bike ${bikeId} not found`);
  const { id, name, status, conditions } = bike;
  res.status(StatusCodes.OK).json(bike);
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
  res.status(StatusCodes.CREATED).send();
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
  res.status(StatusCodes.OK).json(resObj);
};

module.exports.rentBike = async (req, res, next) => {
  /**
   * TODO: sanitize user input
   **/
  const { bikeId } = req.params;
  const { startStationId } = req.body;
  const userId = req.user.id;
  await new Rent()
    .startRent(bikeId, userId, startStationId)
    .then(({ rent, bike, station }) => {
      bike.startRent();
      station.startRent(bikeId);
      res.status(StatusCodes.CREATED).json({ id: rent.id });
    })
    .catch((error) => errorHandlerMiddleware(error, req, res));
};
module.exports.returnBike = async (req, res, next) => {
  /**
   * ToDo: sanitize user input
   */
  const { bikeId } = req.params;
  const { endStationId, rentId } = req.body;
  const userId = req.user.id;

  await Rent.findById(rentId)
    .then((rent) => {
      if (!rent) throw new BadRequestError("please provide a valid rentId");
      rent
        .endRent(bikeId, userId, endStationId)
        .then(({ bike, station }) => {
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
        })
        .catch((error) => errorHandlerMiddleware(error, req, res));
    })
    .catch((error) => errorHandlerMiddleware(error, req, res));
};
module.exports.lockBike = async (req, res, next) => {};
module.exports.unlockBike = async (req, res, next) => {};
module.exports.bookBike = async (req, res, next) => {
  /**
   * ToDo: sanitize user input
   */
  const { bikeId } = req.params;
  const bookingTimeout = Number(process.env.BOOKING_TIMEOUT) * 1000;
  await Bike.findById(bikeId)
    .then((bike) => {})
    .catch((error) => errorHandlerMiddleware(error, req, res));
};
