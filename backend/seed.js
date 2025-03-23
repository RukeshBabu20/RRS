import mongoose from "mongoose";
import Users from "./model/user.js"; // Import the User model
import dotenv from "dotenv";
import TrainDetails from "./model/trainDetails.js";
import Places from "./model/place.js";
import Booking from "./model/booking.js";
import Train from "./model/train.js";

dotenv.config();

mongoose.connect("mongodb://localhost:27017/train");

// Define an admin user
const adminUser = new Users({
  fullName: "Admin User",
  email: "admin@gmail.com",
  password: "$2b$10$QlvzI5Odq0OlhzESE6g8quiV4X1fHM0NirVRyTZ4OeJpiMBEY5acW", // Ensure this is hashed in production
  role: "admin",
});

// Define a function to delete the data present in MongoDB
const deleteData = async () => {
  try {
    await Users.deleteMany({});
    await TrainDetails.deleteMany({});
    await Places.deleteMany({});
    await Booking.deleteMany({});
    await Train.deleteMany({});
    console.log("User data deleted successfully");
  } catch (err) {
    console.error("Error deleting user data", err);
  }
};

// Call the deleteData function before seeding new data
deleteData().then(async () => {
  try {
    await adminUser.save();
    console.log("Admin user seeded successfully");
  } catch (err) {
    console.error("Error seeding admin user", err);
  } finally {
    mongoose.disconnect();
  }
});
