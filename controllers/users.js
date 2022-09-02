const { StatusCodes } = require("http-status-codes");
const errorHandlerMiddleware = require("../middleware/error-handler");
const {
  BadRequestError,
  NotFoundError,
  UnauthorizedError,
} = require("../errors");

const User = require("../db/models/User");
const { getFamilyCode, getOtp } = require("../utils");
const Rent = require("../db/models/Rent");

module.exports = {};

module.exports.signIn = async (req, res) => {
  /**
   * ToDO:  user input check
   * ToDO: delete accounts that do not verify phone number within 5 minutes
   */
  const { phone } = req.body;
  let message = "Use this code to  sign in:  ";
  let user = await User.findOne({ phone }); //check  if user is already registerd
  if (!user) {
    message = "Use this code to  verify your number:  ";
    //new user
    user = await User.create({ phone });
    res.status(StatusCodes.CREATED);
    familyCode = await getFamilyCode();
    user.set("familyCode", familyCode);
  }

  if (user) {
    try {
      const otp = await getOtp();
      user.sendOtpSMS(message, otp);
      //ToDo: REMOVE THE LINE BELOW!!!!!!!!!
      res.json({ otp });
    } catch (error) {
      throw error;
    }
  } else {
    throw new Error(
      "an error occourred during the account creation, try again later"
    );
  }
};

module.exports.verifyOtp = async (req, res) => {
  const { otp, phone } = req.body;
  let user = await User.findOne({ phone, otp });
  if (!user) {
    throw new UnauthorizedError("otp provided is not valid");
  } else {
    user.otpVerified();
    res.status(StatusCodes.OK).json({ token: user.jwtToken });
  }
};

module.exports.getActiveRent = async (req, res) => {
  let rent = await Rent.findOne({ user: req.user.id, endedAt: null });
  res.status(StatusCodes.OK).json({ rent: rent?.id || false });
};
