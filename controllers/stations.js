const Bike = require("../db/models/Bike");
const Location = require("../db/models/Location");
const Rent = require("../db/models/Rent");
const { NotFoundError, BadRequestError } = require("../errors");
const errorHandlerMiddleware = require("../middleware/error-handler");
const { StatusCodes } = require("http-status-codes");
module.exports = {};

module.exports.getAvailableBikes = async (req, res, next) => {
  const defaultLocation = {
    location: {
      type: "Point",
      coords: [process.env.DEFAULT_LONGITUDE, process.env.DEFAULT_LATITUDE],
    },
  };
  const {
    location: {
      coords: [longitude, latitude],
    },
  } = req.body || defaultLocation;
};
