const Bike = require("../db/models/Bike");
const Location = require("../db/models/Location");
const Rent = require("../db/models/Rent");
const { NotFoundError, BadRequestError } = require("../errors");
const errorHandlerMiddleware = require("../middleware/error-handler");
const { StatusCodes } = require("http-status-codes");
const Station = require("../db/models/Station");
module.exports = {};

module.exports.getStartStations = async (req, res, next) => {
  //Valid longitude values are between -180 and 180, both inclusive.
  //Valid latitude values are between -90 and 90, both inclusive.

  const longitude = req.body.longitude || process.env.DEFAULT_LONGITUDE;
  const latitude = req.body.longitude || process.env.DEFAULT_LATITUDE;
  const radius = req.body.radius || process.env.DEFAULT_SEARCH_RADIUS;

  const stations = await Station.find({
    location: {
      $near: {
        $geometry: { type: "Point", coordinates: [longitude, latitude] },
        $maxDistance: radius,
      },
    },
  });
  const _stations = stations.map(({ location, bikes }) => {
    return { location, bikes };
  });
  res.status(StatusCodes.OK).json(_stations);
};
