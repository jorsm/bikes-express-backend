const { StatusCodes } = require("http-status-codes");
const { CustomAPIError } = require("../errors");
const errorHandlerMiddleware = (err, req, res, next) => {
  let customError = {
    // set default
    statusCode: err.statusCode || StatusCodes.INTERNAL_SERVER_ERROR,
    error: err.message || "Something went wrong try again later",
  };

  if (err.name === "ValidationError") {
    customError.error = Object.values(err.errors)
      .map((item) => item.message)
      .join(",");
    customError.statusCode = 400;
  }
  if (err.code && err.code === 11000) {
    customError.error = `Duplicate value entered for ${Object.keys(
      err.keyValue
    )} field, please choose another value`;
    customError.statusCode = 400;
  }
  if (err.name === "CastError") {
    customError.error = `No item found with id : ${err.value}`;
    customError.statusCode = 404;
  }

  if (err instanceof CustomAPIError) {
    return res.status(err.statusCode).json({ error: err.message });
  }
  console.error(err);
  return res.status(customError.statusCode).json({ error: customError.error });
};

module.exports = errorHandlerMiddleware;
