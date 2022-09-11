const { StatusCodes } = require("http-status-codes");
const {
  BadRequestError,
  NotFoundError,
  UnauthorizedError,
} = require("../errors");

const User = require("../db/models/User");
const Rent = require("../db/models/Rent");
const Subscription = require("../db/models/Subscription");

const { getFamilyCode, getOtp } = require("../utils");

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

module.exports.getRent = async (req, res) => {
  let rent = await Rent.findOne({ user: req.user.id, endedAt: null });
  res.status(StatusCodes.OK).json({ rent: rent?.id || false });
};

module.exports.getSubscription = async (req, res) => {
  let subscription = await Subscription.findOne({
    user: req.user.id,
    endsAt: { $gte: new Date() },
  });
  res.status(StatusCodes.OK).json({ rent: subscription?.id || false });
};

module.exports.paypalHandler = async (req, res) => {
  /**
   * Verify that the notification message came from PayPal
   * Was not altered or corrupted during transmission
   * Was targeted for you
   * Contains a valid signature
   */
  console.log("paypal  webhook handler", req.body);
  res.status(StatusCodes.OK).end();
};
