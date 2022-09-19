const { StatusCodes } = require("http-status-codes");
const axios = require("axios").default;
const {
  BadRequestError,
  NotFoundError,
  UnauthorizedError,
} = require("../errors");

const User = require("../db/models/User");
const Rent = require("../db/models/Rent");
const Subscription = require("../db/models/Subscription");
const { PAYPAL_CLIENT_ID, PAYPAL_APP_SECRET } = process.env;

const paypal_url = "https://api-m.sandbox.paypal.com";

const { getFamilyCode, getOtp } = require("../utils");
const { DAY_PRICE, WEEK_PRICE, MONTH_PRICE } = require("../utils/configs");

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
  res.status(StatusCodes.OK).json({ subscription: subscription?.id || false });
};

module.exports.createSubscriptionOrder = async (req, res) => {
  const { subscriptionPeriod } = req.body;
  if (!subscriptionPeriod)
    throw new BadRequestError("subscriptionPeriod is required");

  let subDaysInMs = 24 * 60 * 60 * 1000;
  switch (subscriptionPeriod) {
    case "Day":
      amount = DAY_PRICE;
      break;
    case "Week":
      amount = WEEK_PRICE;
      subDaysInMs = subDaysInMs * 7;
      break;
    case "Month":
      amount = MONTH_PRICE;
      subDaysInMs = subDaysInMs * 30;
      break;
    default:
      throw new BadRequestError("preriod must be Day|Week|Month");
  }

  const endDate = new Date(Date.now() + subDaysInMs);
  const accessToken = await generatePaypalAccessToken();

  const url = `${paypal_url}/v2/checkout/orders`;
  const response = await axios(url, {
    method: "post",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${accessToken}`,
    },
    data: JSON.stringify({
      intent: "CAPTURE",
      purchase_units: [
        {
          amount: {
            currency_code: "EUR",
            value: amount,
          },
        },
      ],
    }),
  });
  if (response.data?.status === "CREATED") {
    //here order is created but no money is moved hence is not a valid suubscription
    const orderID = response.data.id;
    const subscription = new Subscription({
      UserId: req.user.id,
      endsAt: endDate,
      orderId: orderID,
    });
    await subscription.save();
    res.json({ orderID });
  } else throw new Error();
};

module.exports.acceptSubscriptionOrder = async (req, res) => {
  const { orderID } = req.params;
  const url = `${paypal_url}/v2/checkout/orders/${orderID}/capture`;

  const accessToken = await generatePaypalAccessToken();

  const response = await axios(url, {
    method: "post",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${accessToken}`,
    },
  });
  if (response.data?.status === "COMPLETED") {
    const subscription = await Subscription.findOne({ orderId: orderID });
    if (subscription) {
      subscription.paymentConfirmed = true;
      await subscription.save();
      res.json({ subscriptionId: subscription.id });
    }
  } else throw new Error();
};

async function generatePaypalAccessToken() {
  // generate an access token using client id and app secret
  const auth = Buffer.from(PAYPAL_CLIENT_ID + ":" + PAYPAL_APP_SECRET).toString(
    "base64"
  );
  const response = await axios(`${paypal_url}/v1/oauth2/token`, {
    method: "post",
    data: "grant_type=client_credentials",
    headers: {
      Authorization: `Basic ${auth}`,
    },
  });

  return response.data.access_token;
}
