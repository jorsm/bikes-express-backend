const { required, number } = require("joi");
const mongoose = require("mongoose");

const StationSchema = new mongoose.Schema(
  {
    bikes: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Bike",
        required: [true, "must provide bike ID"],
      },
    ],
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
    // max # of bikes parked at the same time
    capacity: {
      type: Number,
      default: 100,
      min: 1,
    },
    // meters from 'location' in wich ending rent is allowed
    radius: {
      type: Number,
      default: 2,
      min: 1,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Station", StationSchema);
