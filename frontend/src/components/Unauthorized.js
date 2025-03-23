import React from "react";
import { useNavigate } from "react-router-dom";

const Unauthorized = () => {
  const navigate = useNavigate();

  const handleGoBack = () => {
    const userRole = localStorage.getItem("role");
    if (userRole === "admin") {
      navigate("/admin");
    } else if (userRole === "user") {
      navigate("/");
    } else {
      navigate("/"); // Default fallback
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
      <h1 className="text-4xl font-bold text-red-600">Access Denied</h1>
      <p className="mt-4 text-lg text-gray-700">
        You do not have permission to view this page.
      </p>
      <button
        onClick={handleGoBack}
        className="mt-6 px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700"
      >
        Go back to Home
      </button>
    </div>
  );
};

export default Unauthorized;
