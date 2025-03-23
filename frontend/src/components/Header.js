// import React, { useState } from "react";
// import { Link, useNavigate } from "react-router-dom";

// const Header = () => {
//   const [user, setUser] = useState(JSON.parse(localStorage.getItem("user")));
//   const navigate = useNavigate();
//   const handleLogout = () => {
//     localStorage.removeItem("user");
//     setUser(null); // Update the state to trigger re-render
//     navigate("/login");
//   };

//   if (user) {
//     const firstName = user.fullName.split(" ")[0];

//     return (
//       // Header when logged in
//       <div className="flex justify-between xl:justify-end space-x-2 mx-4 mt-1 md:-mb-2">
//         <span className="text-[#000] hover:text-[#149ddd] hover:bg-transparent px-4 py-2 border hover:border-[#ee5e5f] rounded-full transition duration-300 focus:outline-none focus:ring bg-[#eca74e] focus:border-blue-300 cursor-default max-w-[8rem] truncate">
//           {firstName}
//         </span>
//         <span
//           onClick={handleLogout}
//           className="text-[#000] hover:text-[#149ddd] hover:bg-transparent px-4 py-2 border hover:border-[#eca74e] rounded-full transition duration-300 focus:outline-none focus:ring bg-[#ee5e5f] focus:border-blue-300 cursor-pointer"
//         >
//           Log Out
//         </span>
//       </div>
//     );
//   }

//   // Header Buttons when not logged in
//   return (
//     <div className="flex justify-between xl:justify-end space-x-2 mx-4 mt-1 -mb-2">
//       <Link
//         to="/login"
//         className="text-[#000] hover:text-[#149ddd] hover:bg-transparent px-4 py-2 border hover:border-[#ee5e5f] rounded-full transition duration-300 focus:outline-none focus:ring bg-[#eca74e] focus:border-blue-300"
//       >
//         Booking
//       </Link>
//       <Link
//         to="/login"
//         className="text-[#000] hover:text-[#149ddd] hover:bg-transparent px-4 py-2 border hover:border-[#ee5e5f] rounded-full transition duration-300 focus:outline-none focus:ring bg-[#eca74e] focus:border-blue-300"
//       >
//         Log In
//       </Link>
//       <Link
//         to="/signup"
//         className="text-[#000] hover:text-[#149ddd] hover:bg-transparent px-4 py-2 border hover:border-[#eca74e] rounded-full transition duration-300 focus:outline-none focus:ring bg-[#ee5e5f] focus:border-blue-300"
//       >
//         Sign Up
//       </Link>
//     </div>
//   );
// };

// export default Header;
import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "../utils/axios";
import { toast } from "react-toastify";

const Header = () => {
  const [user, setUser] = useState(JSON.parse(localStorage.getItem("user")));
  const [isModalOpen, setIsModalOpen] = useState(false); // Modal state
  const [bookingHistory, setBookingHistory] = useState([]); // Booking history state
  const [loadingHistory, setLoadingHistory] = useState(false); // Loading state for history
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("user");
    setUser(null); // Update the state to trigger re-render
    navigate("/login");
  };

  const handleOpenModal = async () => {
    const user = JSON.parse(localStorage.getItem("user"));
    setIsModalOpen(true);
    setLoadingHistory(true);
    try {
      const response = await axios.get(`/api/train/booking-history/${user.id}`);
      setBookingHistory(response.data.bookings);
      setLoadingHistory(false);
    } catch (error) {
      toast.error("Failed to fetch booking history.");
      setLoadingHistory(false);
    }
  };

  const handleCancelBooking = async (
    bookingId,
    seatNumbersToCancel,
    trainId
  ) => {
    try {
      const response = await axios.put(
        `/api/train/train-details/cancel/${bookingId}`,
        { seatNumbersToCancel }
      );
      await axios.put(`/api/train/booking-history/${trainId}`);

      if (response.status === 200) {
        toast.success("Booking canceled successfully.");
        // Update booking history after cancellation
        setBookingHistory((prevHistory) =>
          prevHistory.filter((booking) => booking._id !== bookingId)
        );
      } else {
        toast.error("Failed to cancel booking.");
      }
      handleCloseModal();
    } catch (error) {
      toast.error("An error occurred while canceling the booking.");
    }
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  if (user) {
    const firstName = user.fullName.split(" ")[0];

    return (
      // Header when logged in
      <div className="flex justify-between xl:justify-end space-x-2 mx-4 mt-1 md:-mb-2">
        <span className="text-[#000] hover:text-[#149ddd] hover:bg-transparent px-4 py-2 border hover:border-[#ee5e5f] rounded-full transition duration-300 focus:outline-none focus:ring bg-[#eca74e] focus:border-blue-300 cursor-default max-w-[8rem] truncate">
          {firstName}
        </span>
        <button
          onClick={handleOpenModal}
          className="text-[#000] hover:text-[#149ddd] hover:bg-transparent px-4 py-2 border hover:border-[#eca74e] rounded-full transition duration-300 focus:outline-none focus:ring bg-[#eca74e] focus:border-blue-300"
        >
          View Booking History
        </button>
        <span
          onClick={handleLogout}
          className="text-[#000] hover:text-[#149ddd] hover:bg-transparent px-4 py-2 border hover:border-[#eca74e] rounded-full transition duration-300 focus:outline-none focus:ring bg-[#ee5e5f] focus:border-blue-300 cursor-pointer"
        >
          Log Out
        </span>

        {/* Modal */}
        {/* Modal */}
        {isModalOpen && (
          <div className="modal-overlay fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
            <div
              className="modal-content relative bg-white p-6 rounded-lg shadow-lg w-3/4 max-w-lg"
              style={{ maxHeight: "80vh", overflowY: "auto" }}
            >
              <button
                className="close-button absolute top-2 right-2 text-gray-500 hover:text-gray-800"
                onClick={handleCloseModal}
              >
                &times;
              </button>
              <h3 className="text-xl font-bold mb-4">Booking History</h3>
              {loadingHistory ? (
                <p>Loading...</p>
              ) : bookingHistory.length === 0 ? (
                <p>No booking history found.</p>
              ) : (
                <ul className="space-y-4">
                  {bookingHistory.map((booking) => (
                    <li
                      key={booking._id}
                      className="border p-4 rounded shadow-md"
                    >
                      <p>
                        <strong>Train Name:</strong>{" "}
                        {/* {booking.trainDetails.trainName} */}
                      </p>
                      <p>
                        <strong>From:</strong> {booking.trainDetails.fromPlace}
                      </p>
                      <p>
                        <strong>To:</strong> {booking.trainDetails.toPlace}
                      </p>
                      <p>
                        <strong>Date:</strong>{" "}
                        {new Date(
                          booking.trainDetails.date
                        ).toLocaleDateString()}
                      </p>
                      <p>
                        <strong>Seats:</strong> {booking.seatNumbers.join(", ")}
                      </p>
                      <p>Booking Status: {booking.bookingStatus} </p>

                      {booking.bookingStatus === "Confirmed" && (
                        <button
                          onClick={() =>
                            handleCancelBooking(
                              booking.trainDetails._id,
                              booking.seatNumbers,
                              booking._id
                            )
                          }
                          className="bg-[#eca74e] hover:bg-[#ee5e5f] duration-200 text-white font-bold py-2 px-4 rounded"
                        >
                          Cancel Booking
                        </button>
                      )}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        )}
      </div>
    );
  }

  // Header Buttons when not logged in
  return (
    <div className="flex justify-between xl:justify-end space-x-2 mx-4 mt-1 -mb-2">
      <Link
        to="/login"
        className="text-[#000] hover:text-[#149ddd] hover:bg-transparent px-4 py-2 border hover:border-[#ee5e5f] rounded-full transition duration-300 focus:outline-none focus:ring bg-[#eca74e] focus:border-blue-300"
      >
        Booking
      </Link>
      <Link
        to="/login"
        className="text-[#000] hover:text-[#149ddd] hover:bg-transparent px-4 py-2 border hover:border-[#ee5e5f] rounded-full transition duration-300 focus:outline-none focus:ring bg-[#eca74e] focus:border-blue-300"
      >
        Log In
      </Link>
      <Link
        to="/signup"
        className="text-[#000] hover:text-[#149ddd] hover:bg-transparent px-4 py-2 border hover:border-[#eca74e] rounded-full transition duration-300 focus:outline-none focus:ring bg-[#ee5e5f] focus:border-blue-300"
      >
        Sign Up
      </Link>
    </div>
  );
};

export default Header;
