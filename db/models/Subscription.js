const { required } = require("joi");
const mongoose = require("mongoose");

const SubscriptionSchema = new mongoose.Schema({
  UserId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: [true, "must provide user ID"],
  },
  orderId: String,
  transactionId: { type: String, default: null },
  startedAt: { type: Date, default: Date.now },
  endsAt: { type: Date, default: null },
});

module.exports = mongoose.model("Subscription", SubscriptionSchema);
