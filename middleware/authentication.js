const passport = require("passport");
require("./passport")(passport);
const { UnauthorizedError } = require("../errors");
const errorHandlerMiddleware = require("../middleware/error-handler");
const { StatusCodes } = require("http-status-codes");
module.exports = {};

module.exports.jwtUserAuth = (req, res, next) => {
  passport.authenticate(
    "user-jwt",
    { session: false },
    function (err, user, info) {
      if (err || info instanceof Error) {
        err = info || new UnauthorizedError(err);
        throw err;
      }
      if (user) {
        req.user = user;
        next();
      } else throw new UnauthorizedError("token malformed, please login again");
    }
  )(req, res, next);
};

/*
module.exports.emailLogin = async (req, res, next) => {
  passport.authenticate("local", authCallback(req, res, next))(req, res, next);
};

/*  Sign in/up with Facebook *
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

/*  Sign in/up with Google *
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
 *
const authCallback = (req, res, next) => {
  return function (err, user) {
    let resJson = {};
    if (err) {
      errorHandlerMiddleware(err, req, res, next);
    }
    if (user) {
      resJson = { name: user.name, token: user.jwtToken };
      res.status(StatusCodes.OK).json(resJson);
    }
  };
};*/
