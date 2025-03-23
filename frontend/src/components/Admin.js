import React, { useState, useEffect } from "react";
import axios from "../utils/axios";
import { toast } from "react-toastify";
import Header from "./Header";

const Modal = ({ isOpen, onClose, children }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
      <div className="bg-white rounded-lg p-5 w-1/2">
        <button
          onClick={onClose}
          className="absolute top-2 right-2 text-gray-500 hover:text-gray-800"
        >
          ✖
        </button>
        {children}
      </div>
    </div>
  );
};

const Admin = () => {
  const [activeTab, setActiveTab] = useState("places");
  const [trainData, setTrainData] = useState([]);
  const [placesList, setPlacesList] = useState([]);
  const [newPlace, setNewPlace] = useState("");
  const [newTrain, setNewTrain] = useState({
    fromPlace: "",
    toPlace: "",
    trainName: "",
    trainNumber: "",
    coachName: "",
    numberOfSeats: 0,
    status: "ontime",
    fromTime: "",
    toTime: "",
    date: "",
  });

  const [isPlaceModalOpen, setIsPlaceModalOpen] = useState(false);
  const [isTrainModalOpen, setIsTrainModalOpen] = useState(false);
  const [usersList, setUsersList] = useState([]);

  useEffect(() => {
    const fetchUsersList = async () => {
      try {
        const response = await axios.get("/api/train/users");
        setUsersList(response.data.users);
      } catch (error) {
        console.error("Error fetching users list:", error.message);
        toast.error("Failed to fetch users list");
      }
    };

    if (activeTab === "users") {
      fetchUsersList();
    }
  }, [activeTab]);
  useEffect(() => {
    const fetchTrainData = async () => {
      try {
        const response = await axios.get("/api/train/train-details");
        setTrainData(response.data.trainDetails);
      } catch (error) {
        console.error("Error fetching train data:", error.message);
        toast.error("Failed to fetch train data");
      }
    };

    const fetchPlacesList = async () => {
      try {
        const response = await axios.get("/api/train/places");
        setPlacesList(response.data.places);
      } catch (error) {
        console.error("Error fetching places list:", error.message);
        toast.error("Failed to fetch places list");
      }
    };

    fetchTrainData();
    fetchPlacesList();
  }, []);

  const handlePlaceInputChange = (e) => {
    setNewPlace(e.target.value);
  };

  const handleAddPlace = async () => {
    if (!newPlace.trim()) {
      toast.error("Place name cannot be empty");
      return;
    }

    try {
      const response = await axios.post("/api/train/places", {
        name: newPlace,
      });
      setPlacesList([...placesList, response.data.place]);
      toast.success("Place added successfully!");
      setNewPlace("");
      setIsPlaceModalOpen(false);
    } catch (error) {
      console.error("Error adding place:", error.message);
      toast.error("Failed to add place");
    }
  };

  const handleTrainInputChange = (e) => {
    const { name, value } = e.target;
    setNewTrain({ ...newTrain, [name]: value });
  };

  const handleAddTrain = async () => {
    if (!newTrain.fromPlace || !newTrain.toPlace) {
      toast.error("From and To places must be selected");
      return;
    }

    try {
      const trainToSend = {
        ...newTrain,
        numberOfSeats: Number(newTrain.numberOfSeats),
        availableSeats: Number(newTrain.numberOfSeats),
        bookedSeats: 0,
        vacancy: Number(newTrain.numberOfSeats),
        selectedSeatNumbers: [],
      };

      const response = await axios.post(
        "/api/train/train-details",
        trainToSend
      );

      if (response.data && response.data.trainDetails) {
        setTrainData((prevData) => [...prevData, response.data.trainDetails]);
      } else {
        console.error("Unexpected API response:", response.data);
        toast.error("Failed to add train. Unexpected response.");
      }

      setNewTrain({
        fromPlace: "",
        toPlace: "",
        trainName: "",
        trainNumber: "",
        coachName: "",
        numberOfSeats: 0,
        status: "ontime",
        fromTime: "",
        toTime: "",
        date: "",
      });

      toast.success("Train added successfully!");
      setIsTrainModalOpen(false);
    } catch (error) {
      console.error("Error adding train:", error.message);
      toast.error("Failed to add train");
    }
  };

  return (
    <div className="container mx-auto mt-5">
      <Header />
      <h1 className="text-2xl font-bold mb-5">Admin Panel</h1>

      {/* Tabs */}
      <div className="flex border-b mb-5">
        <button
          className={`px-4 py-2 ${
            activeTab === "places" ? "border-b-2 border-blue-500 font-bold" : ""
          }`}
          onClick={() => setActiveTab("places")}
        >
          Places
        </button>
        <button
          className={`px-4 py-2 ${
            activeTab === "trains" ? "border-b-2 border-blue-500 font-bold" : ""
          }`}
          onClick={() => setActiveTab("trains")}
        >
          Trains
        </button>

        <button
          className={`px-4 py-2 ${
            activeTab === "users" ? "border-b-2 border-blue-500 font-bold" : ""
          }`}
          onClick={() => setActiveTab("users")}
        >
          Users
        </button>
      </div>

      {activeTab === "users" && (
        <div>
          <h2 className="text-xl font-semibold mb-3">Users List</h2>
          <div className="overflow-y-auto max-h-64 border border-gray-300 rounded">
            <table className="table-auto w-full border-collapse border border-gray-300">
              <thead>
                <tr>
                  <th className="border border-gray-300 px-4 py-2">Name</th>
                  <th className="border border-gray-300 px-4 py-2">Email</th>
                  <th className="border border-gray-300 px-4 py-2">Role</th>
                </tr>
              </thead>
              <tbody>
                {usersList.map((user) => (
                  <tr key={user._id}>
                    <td className="border border-gray-300 px-4 py-2">
                      {user.fullName}
                    </td>
                    <td className="border border-gray-300 px-4 py-2">
                      {user.email}
                    </td>
                    <td className="border border-gray-300 px-4 py-2">
                      {user.role}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab Content */}
      {activeTab === "places" && (
        <div>
          <button
            onClick={() => setIsPlaceModalOpen(true)}
            className="bg-green-500 text-white px-4 py-2 rounded mb-5"
          >
            Add New Place
          </button>

          {/* Places List */}
          <div className="mb-5">
            <h2 className="text-xl font-semibold mb-3">Places List</h2>
            <ul className="list-disc pl-5">
              {placesList.map((place, index) => (
                <li key={index} className="mb-1">
                  {place.name}
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}

      {activeTab === "trains" && (
        <div>
          <button
            onClick={() => setIsTrainModalOpen(true)}
            className="bg-blue-500 text-white px-4 py-2 rounded mb-5"
          >
            Add New Train
          </button>

          {/* Train List */}
          <div>
            <h2 className="text-xl font-semibold mb-3">Train List</h2>
            <div className="overflow-y-auto max-h-64 border border-gray-300 rounded">
              <table className="table-auto w-full border-collapse border border-gray-300">
                <thead>
                  <tr>
                    <th className="border border-gray-300 px-4 py-2">From</th>
                    <th className="border border-gray-300 px-4 py-2">To</th>
                    <th className="border border-gray-300 px-4 py-2">
                      Train Name
                    </th>
                    <th className="border border-gray-300 px-4 py-2">
                      Train Number
                    </th>
                    <th className="border border-gray-300 px-4 py-2">Coach</th>
                    <th className="border border-gray-300 px-4 py-2">Seats</th>
                    <th className="border border-gray-300 px-4 py-2">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {trainData &&
                    trainData.map((train) => (
                      <tr key={train.trainNumber}>
                        <td className="border border-gray-300 px-4 py-2">
                          {train.fromPlace}
                        </td>
                        <td className="border border-gray-300 px-4 py-2">
                          {train.toPlace}
                        </td>
                        <td className="border border-gray-300 px-4 py-2">
                          {train.trainName}
                        </td>
                        <td className="border border-gray-300 px-4 py-2">
                          {train.trainNumber}
                        </td>
                        <td className="border border-gray-300 px-4 py-2">
                          {train.coachName}
                        </td>
                        <td className="border border-gray-300 px-4 py-2">
                          {train.numberOfSeats}
                        </td>
                        <td className="border border-gray-300 px-4 py-2">
                          {train.status}
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Place Modal */}
      <Modal
        isOpen={isPlaceModalOpen}
        onClose={() => setIsPlaceModalOpen(false)}
      >
        <h2 className="text-xl font-semibold mb-3">Add New Place</h2>
        <input
          type="text"
          placeholder="Place Name"
          value={newPlace}
          onChange={handlePlaceInputChange}
          className="border rounded px-3 py-2 w-full mb-3"
        />
        <button
          onClick={handleAddPlace}
          className="bg-green-500 text-white px-4 py-2 rounded"
        >
          Add Place
        </button>
      </Modal>

      {/* Train Modal */}
      <Modal
        isOpen={isTrainModalOpen}
        onClose={() => setIsTrainModalOpen(false)}
      >
        <h2 className="text-xl font-semibold mb-3">Add New Train</h2>
        <div className="grid grid-cols-2 gap-4">
          <select
            name="fromPlace"
            value={newTrain.fromPlace}
            onChange={handleTrainInputChange}
            className="border rounded px-3 py-2"
          >
            <option value="">Select From Place</option>
            {placesList.map((place) => (
              <option key={place.name} value={place.name}>
                {place.name}
              </option>
            ))}
          </select>
          <select
            name="toPlace"
            value={newTrain.toPlace}
            onChange={handleTrainInputChange}
            className="border rounded px-3 py-2"
          >
            <option value="">Select To Place</option>
            {placesList
              .filter((place) => place.name !== newTrain.fromPlace)
              .map((place) => (
                <option key={place.name} value={place.name}>
                  {place.name}
                </option>
              ))}
          </select>
          <input
            type="text"
            name="trainName"
            placeholder="Train Name"
            value={newTrain.trainName}
            onChange={handleTrainInputChange}
            className="border rounded px-3 py-2"
          />
          <input
            type="text"
            name="trainNumber"
            placeholder="Train Number"
            value={newTrain.trainNumber}
            onChange={handleTrainInputChange}
            className="border rounded px-3 py-2"
          />
          <input
            type="text"
            name="coachName"
            placeholder="Coach Name"
            value={newTrain.coachName}
            onChange={handleTrainInputChange}
            className="border rounded px-3 py-2"
          />
          <input
            type="number"
            name="numberOfSeats"
            placeholder="Number of Seats"
            value={newTrain.numberOfSeats}
            onChange={handleTrainInputChange}
            className="border rounded px-3 py-2"
          />
          <select
            name="status"
            value={newTrain.status}
            onChange={handleTrainInputChange}
            className="border rounded px-3 py-2"
          >
            <option value="delay">Delay</option>
            <option value="ontime">On Time</option>
          </select>
          <input
            type="time"
            name="fromTime"
            placeholder="From Time"
            value={newTrain.fromTime}
            onChange={handleTrainInputChange}
            className="border rounded px-3 py-2"
          />
          <input
            type="time"
            name="toTime"
            placeholder="To Time"
            value={newTrain.toTime}
            onChange={handleTrainInputChange}
            className="border rounded px-3 py-2"
          />
          <input
            type="date"
            name="date"
            placeholder="Date"
            value={newTrain.date}
            onChange={handleTrainInputChange}
            className="border rounded px-3 py-2"
          />
        </div>
        <button
          onClick={handleAddTrain}
          className="bg-blue-500 text-white px-4 py-2 rounded mt-3"
        >
          Add Train
        </button>
      </Modal>
    </div>
  );
};

export default Admin;
