const { required } = require("joi");
const mongoose = require("mongoose");

const LocationSchema = new mongoose.Schema({
  bikeId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Bike",
    required: [true, "must provide bike ID"],
  },
  timestamp: {
    type: Date,
    default: Date.now(),
  },
  location: {
    type: {
      type: String,
      enum: ["Point"],
      required: true,
    },
    coordinates: {
      //[Longitude, Latitude]
      type: [Number],
      required: true,
    },
  },
});

module.exports = mongoose.model("Location", LocationSchema);
