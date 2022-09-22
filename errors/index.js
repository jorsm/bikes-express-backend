const CustomAPIError = require("./custom-api");
const UnauthorizedError = require("./unauthenticated");
const NotFoundError = require("./not-found");
const BadRequestError = require("./bad-request");
const PaymentRequiredError = require("./payment-required");

module.exports = {
  CustomAPIError,
  UnauthorizedError,
  NotFoundError,
  BadRequestError,
  PaymentRequiredError,
};
