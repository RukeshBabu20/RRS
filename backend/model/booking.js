import mongoose from "mongoose";

const bookingSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Users",
    required: true,
  },
  trainId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Train",
    required: true,
  },
  trainDetails: { type: mongoose.Schema.Types.ObjectId, ref: "TrainDetails" }, // Reference to TrainDetails
  seatNumbers: { type: [String], required: true },
  bookingDate: { type: Date, default: Date.now },
  bookingStatus: {
    type: String,
    enum: ["Cancelled", "Confirmed"],
    default: "Confirmed", // Default value
  },
});

const Booking = mongoose.model("Booking", bookingSchema);
export default Booking;
