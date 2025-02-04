import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Lottie from "lottie-react";
import animationData from "./images/admin.json";

function AdminDashboard() {
  const [currentTime, setCurrentTime] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentTime(now.toLocaleTimeString());
    };

    updateTime(); // Initialize the time immediately
    const intervalId = setInterval(updateTime, 1000); // Update every second

    return () => clearInterval(intervalId); // Cleanup on component unmount
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-100 to-white flex flex-col items-center">
      {/* Header Section */}
      <div className="w-full max-w-5xl bg-white shadow-md rounded-xl p-6 flex justify-between items-center mt-10">
        <div>
          <h1 className="text-2xl font-bold">Welcome</h1>
          <p className="text-gray-600">Good Morning Admin ....!</p>
        </div>
        <div>
          <p className="text-sm text-gray-500">{currentTime}</p>
        </div>
      </div>

      {/* Illustration and Clickable Cards Section */}
      <div className="w-full max-w-5xl bg-white shadow-md rounded-xl mt-6 flex items-center p-6">
        <div className="grid grid-cols-2 gap-4 flex-1">
          
          <div
            className="bg-gray-100 shadow-md rounded-xl p-4 flex flex-col items-center cursor-pointer hover:bg-gray-200"
            onClick={() => navigate("/admin/groups")}
          >
            <p className="text-lg font-bold">Groups</p>
            <p className="text-blue-500 text-xl font-bold">2 groups</p>
          </div>
          <div
            className="bg-gray-100 shadow-md rounded-xl p-4 flex flex-col items-center cursor-pointer hover:bg-gray-200"
            onClick={() => navigate("/contributors")}
          >
            <p className="text-lg font-bold">Contributors</p>
            <p className="text-blue-500 text-xl font-bold">6 contributors</p>
          </div>
          <div
            className="bg-gray-100 shadow-md rounded-xl p-4 flex flex-col items-center cursor-pointer hover:bg-gray-200"
            onClick={() => navigate("/workspaces")}
          >
            <p className="text-lg font-bold">Workspaces</p>
            <p className="text-blue-500 text-xl font-bold">2 workspaces</p>
          </div>
          <div
            className="bg-gray-100 shadow-md rounded-xl p-4 flex flex-col items-center cursor-pointer hover:bg-gray-200"
            onClick={() => navigate("#")}
          >
            <p className="text-lg font-bold">...</p>
            <p className="text-blue-500 text-xl font-bold">...</p>
          </div>
        </div>
        <div className="flex-1">
          <Lottie animationData={animationData} className="w-80 h-80 mx-auto" />
        </div>
      </div>
    </div>
  );
}

export default AdminDashboard;
