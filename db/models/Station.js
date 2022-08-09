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
      index: "2dsphere",
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

StationSchema.methods.startRent = async function (bikeId) {
  this.bikes = this.bikes.filter((_bikeId) => _bikeId != bikeId);
  this.save();
};
StationSchema.methods.endRent = async function (bikeId) {
  if (!this.bikes.includes(bikeId)) this.bikes.push(bikeId);
  this.save();
};

module.exports = mongoose.model("Station", StationSchema);
