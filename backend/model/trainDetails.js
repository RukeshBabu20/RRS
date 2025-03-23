import mongoose from "mongoose";

const trainDetailsSchema = new mongoose.Schema(
  {
    fromPlace: { type: String, required: true },
    toPlace: { type: String, required: true },
    trainName: { type: String, required: true },
    trainNumber: { type: String, required: true },
    coachName: { type: String, required: true },
    numberOfSeats: { type: Number, required: true },
    status: { type: String, required: true },
    availableSeats: { type: Number, required: true }, // Field for available seats
    bookedSeats: { type: Number, required: true }, // Field for booked seats
    vacancy: { type: Number, required: true }, // Field for vacancy
    selectedSeatNumbers: { type: [Number], default: [] }, // Field for selected seat numbers
    fromTime: { type: String, required: true }, // New field for departure time
    toTime: { type: String, required: true }, // New field for arrival time
    date: { type: Date, required: true },
  },
  { timestamps: true }
);

const TrainDetails = mongoose.model("TrainDetails", trainDetailsSchema);

export default TrainDetails;
