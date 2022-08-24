const { StatusCodes } = require("http-status-codes");
const errorHandlerMiddleware = require("../middleware/error-handler");
const {
  BadRequestError,
  NotFoundError,
  UnauthorizedError,
} = require("../errors");

const User = require("../db/models/User");
const { getFamilyCode, getOtp } = require("../utils");

module.exports = {};

module.exports.signIn = async (req, res) => {
  /**
   * ToDO:  user input check
   * ToDO: delete accounts that do not verify phone number within 5 minutes
   */
  const { name, phone } = req.body;
  let message = "Use this code to  sign in:  ";
  let user = await User.findOne({ name, phone }); //check  if user is already registerd
  if (!user) {
    message = "Use this code to  verify your number:  ";
    let phoneAlreadyUsed = await User.findOne({ phone });
    //new user
    user = await User.create({ name, phone });
    if (!phoneAlreadyUsed) user.set({ free_trial: true });
    res.status(StatusCodes.CREATED);
    familyCode = await getFamilyCode();
    user.set("familyCode", familyCode);
  }

  if (user) {
    const otp = await getOtp();
    user.sendOtpSMS(message, otp);
    user.set({ otp: otp });
    await user.save();
  } else {
    throw new Error(
      "an error occourred during the account creation, try again later"
    );
  }
  res.end();
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
