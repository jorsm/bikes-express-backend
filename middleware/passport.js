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
const { db } = require("../db/models/User");

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
   * JWT Tokens used for client API auth from users and brocker
   */
  passport.use(
    "user-jwt",
    new JwtStrategy(
      {
        secretOrKey: process.env.USER_JWT_SECRET,
        jwtFromRequest: ExtractJwt.fromAuthHeaderWithScheme("jwt"),
      },
      function (...args) {
        postgressMiddlwareEnd(done)(null, { id: jwt_payload.id });
      }
    )
  );

  passport.use(
    "mqtt-broker-jwt",
    new JwtStrategy(
      {
        secretOrKey: process.env.MQTT_BROKER_JWT_SECRET,
        jwtFromRequest: ExtractJwt.fromAuthHeaderWithScheme("jwt"),
      },
      function (jwt_payload, done) {
        User.findOne({ id: jwt_payload.id }, postgressMiddlwareEnd(done));
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
      user = user.value; //Raw to Model object
      done(null, user);
    } else {
      done(null, false);
    }
  };
};
