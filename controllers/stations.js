const Bike = require("../db/models/Bike");
const Location = require("../db/models/Location");
const Rent = require("../db/models/Rent");
const { NotFoundError, BadRequestError } = require("../errors");
const errorHandlerMiddleware = require("../middleware/error-handler");
const { StatusCodes } = require("http-status-codes");
const Station = require("../db/models/Station");
const {
  DEFAULT_LATITUDE,
  DEFAULT_LONGITUDE,
  DEFAULT_SEARCH_RADIUS,
} = require("../utils/configs");
module.exports = {};

module.exports.getStartStations = async (req, res, next) => {
  const filter = (station) => station.bikes.length > 0;
  const stations = await getStations(req, filter);
  res.status(StatusCodes.OK).json(stations);
};

module.exports.getEndStations = async (req, res, next) => {
  const filter = (station) => station.capacity - station.bikes.length > 0;
  const stations = await getStations(req, filter);
  res.status(StatusCodes.OK).json(stations);
};

const getCoordinatesFromReq = (req) => {
  //Valid longitude values are between -180 and 180, both inclusive.
  //Valid latitude values are between -90 and 90, both inclusive.
  const longitude = req.body.longitude || DEFAULT_LONGITUDE;
  const latitude = req.body.longitude || DEFAULT_LATITUDE;
  const radius = req.body.radius || DEFAULT_SEARCH_RADIUS;

  return { longitude, latitude, radius };
};

const getStations = async (req, filter) => {
  const { longitude, latitude, radius } = getCoordinatesFromReq(req);

  const stations = await Station.find({
    location: {
      $near: {
        $geometry: { type: "Point", coordinates: [longitude, latitude] },
        $maxDistance: radius,
      },
    },
  });
  return stations.filter(filter).map(({ location, bikes, id }) => {
    const longitude = location.coordinates[0];
    const latitude = location.coordinates[1];
    return { location: { longitude, latitude }, bikes, id };
  });
};
