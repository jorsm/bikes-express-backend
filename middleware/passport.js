//const passport = require("passport");
const LocalStrategy = require("passport-local").Strategy;
const bcrypt = require("bcryptjs");
const FacebookStrategy = require("passport-facebook").Strategy;
const GoogleStrategy = require("passport-google-oauth2").Strategy;
const JwtStrategy = require("passport-jwt").Strategy;
const ExtractJwt = require("passport-jwt").ExtractJwt;

const {
  NotFoundError,
  BadRequestError,
  UnauthorizedError,
} = require("../errors");

const User = require("../db/models/User");

module.exports = function (passport) {
  // passport.use(new StrategyType( {options}, verify(...strategyParams) ))
  /**
   * Email and Password
   */
  passport.use(
    new LocalStrategy(
      {
        usernameField: "email",
      },
      function (email, password, done) {
        callback = async function (err, rawUser) {
          if (rawUser) {
            const isNewUser = !rawUser.lastErrorObject.updatedExisting;
            user = rawUser.value; //raw opbj to model obj
            if (isNewUser) {
              user.hashPassword(password);
              user.sendSignUpEmail();
            } else {
              //registered user
              if (!user.verifiedEmail)
                //check email verification
                err = new UnauthorizedError(
                  "please check your email inbox to confirm your account"
                );
              if (password) {
                rightPassword = await user.comparePassword(password);
                if (!rightPassword)
                  err = new UnauthorizedError("wrong password");
              }
            }
          }
          postgressMiddlwareEnd(done)(err, rawUser);
        };
        updateUser({}, email, done, callback);
      }
    )
  );
  /**
   * Facebook
   */
  passport.use(
    new FacebookStrategy(
      {
        clientID: process.env.FACEBOOK_APP_ID,
        clientSecret: process.env.FACEBOOK_APP_SECRET,
        callbackURL: "/api/v1/users/auth/facebook",
        profileFields: ["id", "email"],
      },
      function (accessToken, refreshToken, user, done) {
        let email =
          user.emails !== undefined
            ? user.emails[0].value
            : user.id + "@facebook.com";
        updateUser({ facebook_id: user.id }, email, done);
      }
    )
  );
  /**
   * Google
   */
  passport.use(
    new GoogleStrategy(
      {
        clientID: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        callbackURL: "/api/v1/users/auth/google",
      },
      function (accessToken, refreshToken, user, done) {
        updateUser({ google_id: user.id }, user.email, done);
      }
    )
  );
  /**
   * JWT Tokens used for client API auth from users and mqtt Brocker
   */
  passport.use(
    "user-jwt",
    new JwtStrategy(
      {
        secretOrKey: process.env.USER_JWT_SECRET,
        jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      },
      function (jwtPayload, done) {
        if (jwtPayload.id)
          postgressMiddlwareEnd(done)(null, { id: jwtPayload.id });
        else
          postgressMiddlwareEnd(done)(
            "Authentication failed, please login again"
          );
      }
    )
  );

  /**
   * Common utils
   */
  const updateUser = function (update, email, done = null, callback) {
    const filter = { email },
      options = {
        upsert: true,
        new: true,
        runValidators: true,
        rawResult: true,
      };
    update = { $set: update };
    callback = callback || postgressMiddlwareEnd(done);

    User.findOneAndUpdate(filter, update, options, callback);
  };
};

const postgressMiddlwareEnd = function (done) {
  return (err, user, info) => {
    if (err) {
      return done(err, false, {
        message: err.message,
      });
    }
    if (user) {
      //ToDo: change to instanceof?
      user = user.value || user; //in case Raw was passed, cast to Model object
      done(null, user, info);
    } else {
      done(null, false, info);
    }
  };
};
