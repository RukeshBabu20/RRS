import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  fullName: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
  },
  password: {
    type: String,
    required: true,
  },
  role: {
    type: String,
    enum: ["admin", "user"], // Allowed values are "admin" and "user"
    default: "user", // Default role is "user"
  },
  dateOfCreation: {
    type: Date,
    default: Date.now,
  },
});

const Users = mongoose.model("Users", userSchema);

export default Users;
