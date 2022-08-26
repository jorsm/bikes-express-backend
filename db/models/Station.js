const { required, number } = require("joi");
const mongoose = require("mongoose");

const StationSchema = new mongoose.Schema(
  {
    bikes: [
      {
        type: String,
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
      default: 5,
      min: 1,
    },
  },
  { timestamps: true }
);

StationSchema.index({ location: "2dsphere" });

StationSchema.methods.startRent = async function (bikeCode) {
  this.bikes = this.bikes.filter((_bikeCode) => _bikeCode != bikeCode);
  this.save();
};
StationSchema.methods.endRent = async function (bikeCode) {
  if (!this.bikes.includes(bikeCode)) this.bikes.push(bikeCode);
  this.save();
};

module.exports = mongoose.model("Station", StationSchema);
