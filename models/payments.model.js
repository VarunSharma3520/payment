const mongoose = require("mongoose");
const { Schema } = mongoose;

// Define the login schema
const paymentSchema = new Schema(
  {
    playerId: {
      type: String,
      unique: true,
    },
    amount: {
      type: String,
      required: [true, "Amount is required"],
    },
    utr: {
      type: String,
      required: [true, "UTR is required"],
    },
    time: {
      type: String,
      required: [true, "Time is required"],
    },
    status: {
      type: String,
      required: [true, "Status is required"],
    }
  },
  {
    timestamps: true,
  }
);

// Export the Login model
const Payment = mongoose.model("payment", paymentSchema);
module.exports = Payment;
