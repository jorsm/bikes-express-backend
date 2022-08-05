const passport = require("passport");
require("../middleware/passport")(passport);
const { StatusCodes } = require("http-status-codes");
const errorHandlerMiddleware = require("../middleware/error-handler");
const {
  BadRequestError,
  NotFoundError,
  UnauthorizedError,
} = require("../errors");

const User = require("../db/models/User");
module.exports = {};

module.exports.emailLogin = async (req, res, next) => {
  passport.authenticate("local", authCallback(req, res, next))(req, res, next);
};

/*  Sign in/up with Facebook */
module.exports.facebookLoginRequest = async (req, res, next) => {
  passport.authenticate("facebook")(req, res, next);
};

module.exports.facebookLoginResponse = async (req, res, next) => {
  passport.authenticate(
    "facebook",
    { session: false },
    authCallback(req, res, next)
  )(req, res, next);
};

/*  Sign in/up with Google */
module.exports.googleLoginRequest = async (req, res, next) => {
  passport.authenticate("google", { scope: ["email"] })(req, res, next);
};
module.exports.googleLoginResponse = async (req, res, next) => {
  passport.authenticate(
    "google",
    { session: false },
    authCallback(req, res, next)
  )(req, res, next);
};
/**
 * Init new JWT token for user, manage errors
 *
 * @param {*} req
 * @param {*} res
 * @returns a function(err, user) that is executed after the local authentication process
 */
const authCallback = (req, res, next) => {
  return function (err, user) {
    let resJson = {};
    if (err) {
      errorHandlerMiddleware(err, req, res, next);
    }
    if (user) {
      resJson = { email: user.email, token: user.createJWT() };
      res.status(StatusCodes.OK).json(resJson);
    }
  };
};
