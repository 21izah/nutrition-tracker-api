const mongoose = require("mongoose");

const trackingSchema = mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "nutrition",
      required: true
    },
    foodId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "foods",
      required: true
    },
    eatenDate: {
      type: String,
      default: new Date().toLocaleDateString()
    },
    quantity: {
      type: Number,
      min: 1,
      required: true
    }
  },

  {
    timestamps: true
  }
);
const trackingModel = mongoose.model("trackings", trackingSchema);

// make sure to always name your collections in plural...

module.exports = trackingModel;
