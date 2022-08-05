const passport = require("passport");
const { BadRequestError } = require("../errors");
const errorHandlerMiddleware = require("../middleware/error-handler");
module.exports = {};
module.exports.jwtUserAuth = (req, res, next) => {
  passport.authenticate(
    "user-jwt",
    { session: false },
    function (err, user, info) {
      if (err || info instanceof Error) {
        err = info || BadRequestError(err);
        errorHandlerMiddleware(err, req, res, next);
      }
      if (user) {
        req.user = user;
      }
    }
  )(req, res, next);
};
