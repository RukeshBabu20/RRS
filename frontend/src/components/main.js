import { useEffect, useState } from "react";
import axios from "../utils/axios";
import { toast } from "react-toastify";
import SocialComp from "../SocialComp";
import Header from "./Header";

const Main = () => {
  const [numSeats, setNumSeats] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [placesList, setPlacesList] = useState([]);
  const [fromPlace, setFromPlace] = useState("");
  const [toPlace, setToPlace] = useState("");
  const [searches, setSearches] = useState([]);
  const [booking, setBooking] = useState({});
  const [bookingStatus, setBookingStatus] = useState(true);
  const [selectedSeats, setSelectedSeats] = useState([]);
  const [date, setDate] = useState("");
  console.log(selectedSeats, "setassssssssssssss");
  const toastFunctions = {
    success: toast.success,
    error: toast.error,
    info: toast.info,
  };

  useEffect(() => {
    const fetchPlacesList = async () => {
      await axios
        .get("/api/train/places")
        .then(function (response) {
          setPlacesList(response.data.places);
        })
        .catch(function (error) {
          toast.error("Failed to load places list");
        });
    };

    fetchPlacesList();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleClearSelection = () => {
    setFromPlace("");
    setToPlace("");
    setDate("");
    setSearches([]);
    setBooking({});
    setBookingStatus(true);
  };

  const handleSearchTrains = async () => {
    if (!fromPlace || !toPlace || !date) {
      toast.error("Please select 'From', 'To' places, and a date");
      return;
    }

    try {
      const response = await axios.get("/api/train/train-details/search", {
        params: {
          fromPlace: fromPlace,
          toPlace: toPlace,
          date: date,
        },
      });
      const searchResults = response.data;
      setSearches(response.data.trainDetails);
      setBookingStatus(true);
      toast.success("Search completed successfully!");
      // You can update the state or UI with the search results here
    } catch (error) {
      setSearches([]);
      toast.error("No Trains Found.");
    }
  };

  const handleBook = (train) => {
    console.log(train);
    setBooking(train);
    setBookingStatus(false);
  };

  // Add a function to handle seat selection
  const handleSeatSelection = (seatNumber) => {
    if (selectedSeats.includes(seatNumber)) {
      // Deselect the seat
      setSelectedSeats(selectedSeats.filter((seat) => seat !== seatNumber));
    } else {
      // Select the seat
      setSelectedSeats([...selectedSeats, seatNumber]);
    }
  };

  // Add a function to update the train details API
  const handleUpdateSeats = async () => {
    const user = JSON.parse(localStorage.getItem("user"));
    if (selectedSeats.length === 0) {
      toast.error("Please select at least one seat to book.");
      return;
    }

    try {
      const updatedTrainDetails = {
        bookedSeats: booking.bookedSeats + selectedSeats.length, // Increment booked seats count
        availableSeats: booking.availableSeats - selectedSeats.length, // Decrement available seats count
        selectedSeatNumbers: selectedSeats, // Newly selected seats
        vacancy: booking.vacancy - selectedSeats.length, // Update vacancy
      };
      console.log(updatedTrainDetails);

      const response = await axios.put(
        `/api/train/train-details/${booking._id}`,
        updatedTrainDetails
      );

      const bookingHistoryPayload = {
        userId: user.id, // Replace with the actual user ID (e.g., from context or state)
        trainId: booking._id,
        seatNumbers: selectedSeats,
        bookingStatus: "Confirmed",
      };

      await axios.post("/api/train/booking-history", bookingHistoryPayload);

      toast.success("Seats booked successfully!");
      setSelectedSeats([]); // Clear selected seats after successful booking
      setBooking(response.data.trainDetails); // Update booking with the latest train details
    } catch (error) {
      console.error("Failed to update seats:", error.message);
      toast.error("Failed to book seats. Please try again.");
    }
  };

  console.log("asfasd", booking);

  return (
    <>
      <Header />
      <div className="container mx-auto mt-5 flex flex-col md:flex-row items-center">
        <div className="max-w-md mx-auto md:max-w-2xl text-center">
          <h2 className="text-2xl text-[#ee5e5f] font-bold border-b border-[#eca74e4f] flex flex-col md:flex-row md:items-center md:justify-center">
            <span>Train Booking System by </span>
            <span className="md:ml-2">
              <a
                href="https://vaibhaw.netlify.app"
                target="_blank"
                className="text-[#eca74e] hover:text-[#149ddd] duration-500"
                rel="noreferrer"
              >
                Vaibhaw Mishra
              </a>
            </span>
          </h2>

          <div className="flex flex-col md:flex-row md:items-center md:justify-between mt-3">
            <div className="w-full md:w-1/2 md:mr-2">
              <label htmlFor="fromPlace" className="block text-left mb-2">
                From:
              </label>
              <select
                id="fromPlace"
                className="appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                value={fromPlace}
                onChange={(e) => {
                  setFromPlace(e.target.value);
                  setToPlace("");
                }}
              >
                <option value="">Select a place</option>
                {placesList.map((place) => (
                  <option key={place.name} value={place.name}>
                    {place.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="w-full md:w-1/2 md:ml-2 mt-5 md:mt-0">
              <label htmlFor="toPlace" className="block text-left mb-2">
                To:
              </label>
              <select
                id="toPlace"
                className="appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                value={toPlace}
                onChange={(e) => setToPlace(e.target.value)}
              >
                <option value="">Select a place</option>
                {placesList
                  .filter((place) => place.name !== fromPlace) // Exclude the selected "From" place
                  .map((place) => (
                    <option key={place.name} value={place.name}>
                      {place.name}
                    </option>
                  ))}
              </select>
            </div>
            <div className="w-full md:w-1/2 md:ml-2 mt-5 md:mt-0">
              <label htmlFor="date" className="block text-left mb-2">
                Date:
              </label>
              <input
                type="date"
                id="date"
                className="appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                min={new Date().toISOString().split("T")[0]} // Dynamically set today's date as the minimum
              />
            </div>
          </div>

          <div className="flex justify-between items-center">
            <button
              className="bg-[#eca74e] hover:bg-[#ee5e5f] duration-200 text-white font-bold py-2 px-4 rounded"
              onClick={handleSearchTrains}
            >
              Search
            </button>
            <button
              className="bg-[#eca74e] hover:bg-[#ee5e5f] duration-200 text-white font-bold py-2 px-4 rounded mt-2"
              onClick={handleClearSelection}
            >
              Clear
            </button>
          </div>

          <div>
            <>
              {searches.length > 0 ? (
                <div className="mt-">
                  <h3 className="text-xl font-bold mb-2">Search Results</h3>
                  <div className="grid grid-cols-1 gap-4 p-2">
                    {searches.map((train, index) => (
                      <div
                        key={index}
                        className="flex justify-between items-center border p-4 rounded shadow-md"
                      >
                        <div className="relative rounded">
                          <div className="flex flex-col items-center">
                            <p className="font-semibold">
                              Train Name: {train.trainName}
                            </p>
                            <p>Train Number: {train.trainNumber}</p>
                            <p className="mt-0">Coach: {train.coachName}</p>
                            <p className="mt-0">
                              Departure: {train.fromTime} - Arrival:{" "}
                              {train.toTime}
                            </p>
                          </div>
                        </div>
                        <div className="flex flex-col items-center">
                          <p className="text-sm font-semibold text-gray-500 mb-2">
                            Status: {train.status}
                          </p>
                          <button
                            className="bg-[#eca74e] hover:bg-[#ee5e5f] duration-200 text-white font-bold py-2 px-4 rounded"
                            // onClick={() => setBooking(train)}
                            onClick={async () => {
                              try {
                                const response = await axios.get(
                                  `/api/train/train-details/${train._id}`
                                );
                                setBooking(response.data.trainDetails); // Update booking with the latest train details
                              } catch (error) {
                                console.error(
                                  "Failed to fetch train details:",
                                  error.message
                                );
                                toast.error(
                                  "Failed to fetch train details. Please try again."
                                );
                              }
                            }}
                          >
                            Book
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                "No trains found."
              )}
            </>
          </div>

          {errorMessage && (
            <div className="text-red-500 mt-2">{errorMessage}</div>
          )}
        </div>
        <div className=" mx-auto w-1/2 md:ml-5 mt-5 md:mt-0">
          <>
            {Object.keys(booking).length > 0 && (
              <button
                className="bg-[#eca74e] hover:bg-[#ee5e5f] duration-200 text-white font-bold py-2 px-4 rounded mt-4"
                onClick={handleUpdateSeats}
              >
                Confirm Booking
              </button>
            )}
            <div className="max-w-md mx-auto bg-white rounded-xl shadow-md overflow-hidden mb-5">
              <div className="px-6 py-4">
                <div className="grid grid-cols-2 gap-2">
                  <div className="flex justify-center items-center">
                    <i className="fa-solid fa-couch text-green-500"></i>
                    <span className="ml-2 text-sm">Available</span>
                  </div>
                  <div className="flex items-center">
                    <i className="fa-solid fa-couch text-red-500"></i>
                    <span className="ml-2 text-sm">Booked</span>
                  </div>
                </div>
              </div>
            </div>
            <div className="mx-auto bg-white rounded-xl shadow-md overflow-hidden">
              <div className="px-6 py-4">
                <div
                  className="grid grid-cols-7 gap-1 justify-center text-center overflow-y-auto"
                  style={{ maxHeight: "300px", overflow: "auto" }}
                >
                  {Array.from({ length: booking.numberOfSeats }, (_, index) => {
                    const seatNumber = index + 1;
                    const isBooked =
                      booking.selectedSeatNumbers?.includes(seatNumber);
                    const isSelected = selectedSeats.includes(seatNumber);

                    return (
                      <div
                        key={index}
                        className={`cursor-pointer ${
                          isBooked
                            ? "text-red-500"
                            : isSelected
                            ? "text-red-500"
                            : "text-green-500"
                        }`}
                        onClick={() =>
                          !isBooked && handleSeatSelection(seatNumber)
                        }
                      >
                        <i className="fa-solid fa-couch"></i>
                        <div className="text-sm">{seatNumber}</div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </>
        </div>
      </div>
    </>
  );
};

export default Main;
