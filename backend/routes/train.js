import express from "express";
import Train from "../model/train.js";
import Users from "../model/user.js";
import Place from "../model/place.js";
import TrainDetails from "../model/trainDetails.js"; // Assuming a TrainDetails model exists
import Booking from "../model/booking.js";

const trainRouter = express.Router(); // Assuming a Place model exists

trainRouter.get("/train-details", async (req, res) => {
  try {
    const trainDetails = await TrainDetails.find().select("-__v");

    if (!trainDetails || trainDetails.length === 0) {
      return res
        .status(404)
        .json({ status: "error", message: "No train details found" });
    }

    res.status(200).json({ status: "success", trainDetails });
  } catch (err) {
    console.error(err);
    res.status(500).json({ status: "error", message: "Server error" });
  }
});

trainRouter.put("/booking-history/:bookingId", async (req, res) => {
  try {
    const { bookingId } = req.params;

    // Find the booking by ID
    const booking = await Booking.findById(bookingId);

    if (!booking) {
      return res.status(404).json({
        status: "error",
        message: "Booking not found",
      });
    }

    // Update the booking status to "Cancelled"
    booking.bookingStatus = "Cancelled";

    // Save the updated booking
    await booking.save();

    res.status(200).json({
      status: "success",
      message: "Booking status updated to 'Cancelled'",
      booking,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ status: "error", message: "Server error" });
  }
});

// filepath: d:\pem-chip\train-booking-master\backend\routes\train.js
trainRouter.post("/booking-history", async (req, res) => {
  try {
    const { userId, trainId, seatNumbers, bookingStatus } = req.body;

    // Validate input
    if (!userId || !trainId || !seatNumbers || !Array.isArray(seatNumbers)) {
      return res.status(400).json({
        status: "error",
        message: "userId, trainId, and seatNumbers are required",
      });
    }

    // Fetch train details
    const trainDetails = await TrainDetails.findById(trainId);
    if (!trainDetails) {
      return res.status(404).json({
        status: "error",
        message: "Train details not found",
      });
    }

    // Create a new booking
    const newBooking = new Booking({
      userId,
      trainId,
      trainDetails: trainDetails._id, // Set trainDetails reference
      seatNumbers,
      bookingStatus,
      bookingDate: new Date(),
    });

    await newBooking.save();

    res.status(201).json({
      status: "success",
      message: "Booking created successfully",
      booking: newBooking,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ status: "error", message: "Server error" });
  }
});

trainRouter.get("/booking-history/:userId", async (req, res) => {
  try {
    const { userId } = req.params;

    // Fetch the user's role
    const user = await Users.findById(userId).select("role");
    if (!user) {
      return res.status(404).json({
        status: "error",
        message: "User not found",
      });
    }

    let bookings;

    if (user.role === "admin") {
      // Fetch all bookings if the user is an admin
      bookings = await Booking.find().populate({
        path: "trainDetails",
        select: "trainName trainNumber fromPlace toPlace date", // Specify fields to include
      });
    } else {
      // Fetch bookings for the specific user
      bookings = await Booking.find({ userId }).populate({
        path: "trainDetails",
        select: "trainName trainNumber fromPlace toPlace date", // Specify fields to include
      });
    }

    if (!bookings || bookings.length === 0) {
      return res.status(404).json({
        status: "error",
        message: "No booking history found",
      });
    }

    res.status(200).json({
      status: "success",
      bookings,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ status: "error", message: "Server error" });
  }
});

// Endpoint to get all bookings done by a user
trainRouter.get("/bookings/:userId", async (req, res) => {
  try {
    const { userId } = req.params;

    // Find all bookings for the user
    const bookings = await Booking.find({ userId }).populate("trainDetails");

    if (!bookings || bookings.length === 0) {
      return res.status(404).json({
        status: "error",
        message: "No bookings found for this user",
      });
    }

    res.status(200).json({
      status: "success",
      bookings,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ status: "error", message: "Server error" });
  }
});

// trainRouter.put("/train-details/cancel/:id", async (req, res) => {
//   try {
//     const { id } = req.params; // Train ID from the URL
//     const { seatNumbersToCancel } = req.body; // Seats to cancel

//     // Validate input
//     if (
//       !seatNumbersToCancel ||
//       !Array.isArray(seatNumbersToCancel) ||
//       seatNumbersToCancel.length === 0
//     ) {
//       return res.status(400).json({
//         status: "error",
//         message: "seatNumbersToCancel must be a non-empty array",
//       });
//     }

//     // Find the train details by ID
//     const trainDetails = await TrainDetails.findById(id);

//     if (!trainDetails) {
//       return res.status(404).json({
//         status: "error",
//         message: "Train details not found",
//       });
//     }

//     // Check if the seats to cancel are actually booked
//     const invalidSeats = seatNumbersToCancel.filter(
//       (seat) => !trainDetails.selectedSeatNumbers.includes(seat)
//     );

//     if (invalidSeats.length > 0) {
//       return res.status(400).json({
//         status: "error",
//         message: `The following seats are not booked: ${invalidSeats.join(
//           ", "
//         )}`,
//       });
//     }

//     // Update the fields
//     trainDetails.selectedSeatNumbers = trainDetails.selectedSeatNumbers.filter(
//       (seat) => !seatNumbersToCancel.includes(seat)
//     );
//     trainDetails.bookedSeats -= seatNumbersToCancel.length;
//     trainDetails.availableSeats += seatNumbersToCancel.length;

//     // Save the updated train details
//     await trainDetails.save();

//     res.status(200).json({
//       status: "success",
//       message: "Booking cancelled successfully",
//       trainDetails,
//     });
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ status: "error", message: "Server error" });
//   }
// });

trainRouter.put("/train-details/cancel/:id", async (req, res) => {
  try {
    const { id } = req.params; // Train ID from the URL
    const { seatNumbersToCancel } = req.body; // Seats to cancel

    // Validate input
    if (
      !seatNumbersToCancel ||
      !Array.isArray(seatNumbersToCancel) ||
      seatNumbersToCancel.length === 0
    ) {
      return res.status(400).json({
        status: "error",
        message: "seatNumbersToCancel must be a non-empty array",
      });
    }

    // Find the train details by ID
    const trainDetails = await TrainDetails.findById(id);

    if (!trainDetails) {
      return res.status(404).json({
        status: "error",
        message: "Train details not found",
      });
    }

    // Convert both arrays to strings for comparison
    const selectedSeatNumbers = trainDetails.selectedSeatNumbers.map(String);
    const seatsToCancel = seatNumbersToCancel.map(String);

    // Check if the seats to cancel are actually booked
    const invalidSeats = seatsToCancel.filter(
      (seat) => !selectedSeatNumbers.includes(seat)
    );

    if (invalidSeats.length > 0) {
      return res.status(400).json({
        status: "error",
        message: `The following seats are not booked: ${invalidSeats.join(
          ", "
        )}`,
      });
    }

    // Update the fields
    trainDetails.selectedSeatNumbers = selectedSeatNumbers.filter(
      (seat) => !seatsToCancel.includes(seat)
    );
    trainDetails.bookedSeats -= seatsToCancel.length;
    trainDetails.availableSeats += seatsToCancel.length;

    // Save the updated train details
    await trainDetails.save();

    res.status(200).json({
      status: "success",
      message: "Booking cancelled successfully",
      trainDetails,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ status: "error", message: "Server error" });
  }
});

// Endpoint to update train details
trainRouter.put("/train-details/:id", async (req, res) => {
  try {
    const { id } = req.params; // Train ID from the URL
    const { bookedSeats, availableSeats, selectedSeatNumbers, vacancy } =
      req.body;

    // Validate input
    if (
      bookedSeats === undefined &&
      availableSeats === undefined &&
      selectedSeatNumbers === undefined &&
      vacancy === undefined
    ) {
      return res.status(400).json({
        status: "error",
        message:
          "At least one field (bookedSeats, availableSeats, selectedSeatNumbers, vacancy) is required",
      });
    }

    // Find the train details by ID
    const trainDetails = await TrainDetails.findById(id);

    if (!trainDetails) {
      return res.status(404).json({
        status: "error",
        message: "Train details not found",
      });
    }

    // Update the fields if provided
    if (bookedSeats !== undefined) trainDetails.bookedSeats = bookedSeats;
    if (availableSeats !== undefined)
      trainDetails.availableSeats = availableSeats;
    // if (selectedSeatNumbers !== undefined)
    //   trainDetails.selectedSeatNumbers = selectedSeatNumbers;
    if (selectedSeatNumbers !== undefined) {
      // Merge existing and new selectedSeatNumbers, removing duplicates
      trainDetails.selectedSeatNumbers = [
        ...new Set([
          ...trainDetails.selectedSeatNumbers, // Existing values
          ...selectedSeatNumbers, // New values
        ]),
      ];
    }
    if (vacancy !== undefined) trainDetails.vacancy = vacancy;

    // Save the updated train details
    await trainDetails.save();

    res.status(200).json({
      status: "success",
      message: "Train details updated successfully",
      trainDetails,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ status: "error", message: "Server error" });
  }
});

// Endpoint to fetch train details by fromPlace, toPlace, and date
trainRouter.get("/train-details/search", async (req, res) => {
  try {
    const { fromPlace, toPlace, date } = req.query;

    if (!fromPlace || !toPlace || !date) {
      return res.status(400).json({
        status: "error",
        message: "fromPlace, toPlace, and date are required",
      });
    }

    const trainDetails = await TrainDetails.find({
      fromPlace,
      toPlace,
      date,
    }).select("-__v");

    if (!trainDetails || trainDetails.length === 0) {
      return res.status(404).json({
        status: "error",
        message: "No train details found for the specified route and date",
      });
    }

    res.status(200).json({ status: "success", trainDetails });
  } catch (err) {
    console.error(err);
    res.status(500).json({ status: "error", message: "Server error" });
  }
});

// Endpoint to create new train details
trainRouter.post("/train-details", async (req, res) => {
  try {
    const {
      fromPlace,
      toPlace,
      trainName,
      trainNumber,
      coachName,
      numberOfSeats,
      status,
      fromTime,
      toTime,
      date,
      availableSeats,
      bookedSeats,
      vacancy,
      selectedSeatNumbers,
    } = req.body;
    if (
      !fromPlace ||
      !toPlace ||
      !trainName ||
      !trainNumber ||
      !coachName ||
      !numberOfSeats ||
      !status ||
      !fromTime ||
      !toTime ||
      !date
    ) {
      return res
        .status(400)
        .json({ status: "error", message: "All fields are required" });
    }

    const newTrainDetails = new TrainDetails({
      fromPlace,
      toPlace,
      trainName,
      trainNumber,
      coachName,
      numberOfSeats,
      status,
      fromTime,
      toTime,
      date,
      availableSeats: availableSeats || numberOfSeats, // Default to numberOfSeats if not provided
      bookedSeats: bookedSeats || 0, // Default to 0 if not provided
      vacancy: vacancy || numberOfSeats, // Default to numberOfSeats if not provided
      selectedSeatNumbers: selectedSeatNumbers || [], // Default to an empty array if not provided
    });

    await newTrainDetails.save();

    res.status(201).json({
      status: "success",
      message: "Train details created successfully",
      trainDetails: newTrainDetails,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ status: "error", message: "Server error" });
  }
});

// Endpoint to get the list of all places
trainRouter.get("/places", async (req, res) => {
  try {
    const places = await Place.find().select("-__v");

    if (!places || places.length === 0) {
      return res
        .status(404)
        .json({ status: "error", message: "No places found" });
    }

    res.status(200).json({ status: "success", places });
  } catch (err) {
    console.error(err);
    res.status(500).json({ status: "error", message: "Server error" });
  }
});

// Endpoint to get the list of all users
trainRouter.get("/users", async (req, res) => {
  try {
    const users = await Users.find().select("-password -__v"); // Exclude sensitive fields like password

    if (!users || users.length === 0) {
      return res
        .status(404)
        .json({ status: "error", message: "No users found" });
    }

    res.status(200).json({ status: "success", users });
  } catch (err) {
    console.error(err);
    res.status(500).json({ status: "error", message: "Server error" });
  }
});

// Endpoint to create a list of places
trainRouter.post("/places", async (req, res) => {
  try {
    const { name } = req.body;

    if (!name) {
      return res
        .status(400)
        .json({ status: "error", message: "Place name is required" });
    }

    const newPlace = new Place({ name });
    await newPlace.save();

    res.status(201).json({
      status: "success",
      message: "Place created successfully",
      place: newPlace,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ status: "error", message: "Server error" });
  }
});

// Endpoint to fetch train details by train ID
trainRouter.get("/train-details/:id", async (req, res) => {
  try {
    const { id } = req.params; // Extract train ID from the URL

    // Find the train details by ID
    const trainDetails = await TrainDetails.findById(id).select("-__v");

    if (!trainDetails) {
      return res.status(404).json({
        status: "error",
        message: "Train details not found",
      });
    }

    res.status(200).json({
      status: "success",
      trainDetails,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ status: "error", message: "Server error" });
  }
});

// Route for allowing any user to book seats
trainRouter.post("/", async (req, res) => {
  try {
    // Extract user ID from request headers
    const userId = req.headers["user-id"];

    // Check if the user exists based on the extracted ID
    if (userId !== null || userId !== undefined) {
      const user = await Users.findById(userId);
      if (!user) {
        return res
          .status(404)
          .json({ status: "error", message: "Please login first" });
      }
    } else {
      return res
        .status(404)
        .json({ status: "error", message: "Please login first" });
    }

    // Parse the requested number of seats from the client
    const numSeats = parseInt(req.body.numSeats);

    if (!numSeats || numSeats < 1 || numSeats > 7) {
      return res.status(400).json({
        status: "info",
        message: "Invalid number of seats requested",
      });
    }

    // Find the train with its coach and bookings data
    const train = await Train.findOne()
      .populate("coach.seats")
      .populate("bookings");

    if (!train) {
      return res
        .status(404)
        .json({ status: "error", message: "Train not found" });
    }

    // Find the available seats for the requested number of seats
    let availableSeats = findAvailableSeats(train.coach.seats, numSeats);

    if (!availableSeats) {
      return res
        .status(400)
        .json({ status: "info", message: "No seats available" });
    }

    // Mark the available seats as booked
    markSeatsAsBooked(train, availableSeats);

    // Create a new booking with the booked seat numbers
    const newBooking = new Train({
      coach: { seats: train.coach.seats },
      bookings: [{ seats: availableSeats }],
    });

    // Save the new booking to the database
    await newBooking.save();

    // Send the booked seat numbers to the client
    res.status(200).json({ status: "success", seats: availableSeats });
  } catch (err) {
    console.error(err);
    res.status(500).json({ status: "error", message: "Server error" });
  }
});

// Helper function to mark the booked seats as booked
function markSeatsAsBooked(train, bookedSeats) {
  const seats = train.coach.seats;
  for (let i = 0; i < seats.length; i++) {
    if (bookedSeats.includes(seats[i].number)) {
      seats[i].isBooked = true;
    }
  }
  train.markModified("coach.seats");
  return train.save();
}

// Helper function to find the available seats for a requested number of seats
function findAvailableSeats(seats, numSeats) {
  let availableSeats = [];
  let currentSequence = 0;
  let start = 0;

  for (let i = 0; i < seats.length; i++) {
    if (!seats[i].isBooked) {
      currentSequence++;

      if (currentSequence === 1) {
        start = i;
      }

      if (currentSequence === numSeats) {
        for (let j = start; j <= i; j++) {
          availableSeats.push(seats[j].number);
        }

        return availableSeats;
      }
    } else {
      availableSeats = [];
      currentSequence = 0;
    }
  }

  return null;
}

export default trainRouter;
