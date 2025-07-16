"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { timeRecordsService } from "../../services/api";

export default function DashboardPage() {
  const [user, setUser] = useState(null);
  const [timeRecords, setTimeRecords] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [timeInOut, setTimeInOut] = useState({ timeIn: null, timeOut: null });
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [currentAction, setCurrentAction] = useState(null); // 'timeIn' or 'timeOut'
  const router = useRouter();

  const recordsPerPage = 10;

  useEffect(() => {
    const userData = localStorage.getItem("user");
    if (!userData) {
      router.push("/");
      return;
    }

    setUser(JSON.parse(userData));
    fetchTimeRecords();
  }, [router]);

  const fetchTimeRecords = async () => {
    try {
      const data = await timeRecordsService.getTimeRecords();
      setTimeRecords(data.timeRecords);

      // Check for today's record to determine button state
      if (user) {
        const today = new Date().toISOString().split("T")[0];
        const todayRecord = data.timeRecords.find(
          (record) =>
            record.employeeId === user.employee.id && record.date === today
        );

        if (todayRecord) {
          setTimeInOut({
            timeIn: todayRecord.timeIn || null,
            timeOut: todayRecord.timeOut || null,
          });
        } else {
          setTimeInOut({ timeIn: null, timeOut: null });
        }
      }
    } catch (error) {
      console.error("Error fetching time records:", error);
    } finally {
      setLoading(false);
    }
  };

  const showMessage = (msg, type) => {
    setMessage(msg);
    setMessageType(type);
    setTimeout(() => {
      setMessage("");
      setMessageType("");
    }, 5000);
  };

  const handleTimeIn = async () => {
    if (!user) return;
    setShowModal(false);

    try {
      const timeIn = new Date().toLocaleTimeString("en-US", {
        hour12: true,
        hour: "2-digit",
        minute: "2-digit",
      });

      await timeRecordsService.timeIn(
        user.employee.id,
        new Date().toISOString().split("T")[0],
        timeIn
      );

      fetchTimeRecords();
      setTimeInOut({ ...timeInOut, timeIn: timeIn });
      showMessage("Time in recorded successfully!", "success");
    } catch (error) {
      console.error("Error recording time in:", error);
      showMessage(
        error.response?.data?.message || "Error recording time in",
        "error"
      );
    }
  };

  const handleTimeOut = async () => {
    if (!user) return;
    setShowModal(false);

    try {
      const timeOut = new Date().toLocaleTimeString("en-US", {
        hour12: true,
        hour: "2-digit",
        minute: "2-digit",
      });

      await timeRecordsService.timeOut(
        user.employee.id,
        new Date().toISOString().split("T")[0],
        timeOut
      );

      fetchTimeRecords();
      setTimeInOut({ ...timeInOut, timeOut: timeOut });
      showMessage("Time out recorded successfully!", "success");
    } catch (error) {
      console.error("Error recording time out:", error);
      showMessage(
        error.response?.data?.message || "Error recording time out",
        "error"
      );
    }
  };

  const handleTimeAction = () => {
    const currentTime = new Date().toLocaleTimeString();

    if (!timeInOut.timeIn) {
      // Show confirmation for Time In
      setCurrentAction("timeIn");
      setShowModal(true);
    } else if (!timeInOut.timeOut) {
      // Show confirmation for Time Out
      setCurrentAction("timeOut");
      setShowModal(true);
    }
  };

  const confirmAction = () => {
    if (currentAction === "timeIn") {
      handleTimeIn();
    } else if (currentAction === "timeOut") {
      handleTimeOut();
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("user");
    router.push("/");
  };

  const getCurrentDateTime = () => {
    const now = new Date();
    return now.toLocaleDateString() + " " + now.toLocaleTimeString();
  };

  // Filter records for current user
  const userRecords = timeRecords
    .filter((record) => record.employeeId === user?.employee?.id)
    .slice(0, 100); // Limit to maximum 100 records

  // Pagination logic
  const indexOfLastRecord = currentPage * recordsPerPage;
  const indexOfFirstRecord = indexOfLastRecord - recordsPerPage;
  const currentRecords = userRecords.slice(
    indexOfFirstRecord,
    indexOfLastRecord
  );
  const totalPages = Math.ceil(userRecords.length / recordsPerPage);

  // Button text and color based on time in/out state
  const getButtonText = () => {
    if (!timeInOut.timeIn) {
      return "Time In";
    } else if (!timeInOut.timeOut) {
      return "Time Out";
    } else {
      return "Completed";
    }
  };

  const getButtonClass = () => {
    if (!timeInOut.timeIn) {
      return "bg-green-600 hover:bg-green-700";
    } else if (!timeInOut.timeOut) {
      return "bg-blue-600 hover:bg-blue-700";
    } else {
      return "bg-gray-400 cursor-not-allowed";
    }
  };

  const isButtonDisabled = () => {
    return timeInOut.timeIn && timeInOut.timeOut;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-lg text-gray-600 dark:text-gray-400">
          Loading...
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Confirmation Modal */}
      {showModal && (
        <div
          className="fixed inset-0 overflow-y-auto h-full w-full z-50 flex items-start pt-20 justify-center"
          style={{ backgroundColor: "rgba(0, 0, 0, 0.3)" }}
        >
          <div className="bg-white dark:bg-gray-800 rounded shadow-xl   ">
            {/* Modal Header */}
            <div className=" dark:border-gray-700 px-4 py-3 flex justify-between items-center">
              <h5 className="text-lg font-medium text-gray-900 dark:text-white">
                {currentAction === "timeIn" ? "Time In" : "Time Out"}
              </h5>
              <button
                onClick={() => setShowModal(false)}
                className="text-gray-400 hover:text-gray-500 focus:outline-none cursor-pointer"
              ></button>
            </div>

            {/* Modal Body */}
            <div className="px-4 py-4">
              <p className="text-black-600 dark:text-black-300">
                Are you sure you want to{" "}
                {currentAction === "timeIn" ? "time in" : "time out"} at{" "}
                {new Date().toLocaleTimeString()}?
              </p>
            </div>

            {/* Modal Footer */}
            <div className=" border-gray-200 dark:border-gray-700 px-4 py-3 flex justify-end space-x-3">
              <button
                onClick={confirmAction}
                className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white cursor-pointer bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Yes
              </button>
              <button
                onClick={() => setShowModal(false)}
                className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 cursor-pointer bg-white hover:bg-gray-50 dark:bg-gray-700 dark:text-gray-300 dark:border-gray-600 dark:hover:bg-gray-600"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      {/* Header */}
      <header className="bg-gray-800 shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-7">
            <div>
              <h1 className="text-2xl font-bold text-white">
                Exam <span className="text-teal-400">track</span>
              </h1>
            </div>
            <div className="flex items-center space-x-6">
              <div className="flex items-center space-x-4">
                <button className="text-gray-300 hover:text-white text-sm">
                  My Request
                </button>
                <button className="text-gray-300 hover:text-white text-sm">
                  Adminstration Tools
                </button>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center">
                  <span className="text-white text-sm font-semibold">
                    {user.employee?.firstName?.charAt(0) || "U"}
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-gray-300 text-sm">My Account</span>
                  <svg
                    className="w-4 h-4 text-gray-300"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                </div>
              </div>
              <button
                onClick={handleLogout}
                className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md text-sm font-medium cursor-pointer"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          {/* Message Display */}
          {message && (
            <div
              className={`mb-4 p-4 rounded-md ${
                messageType === "success"
                  ? "bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-100"
                  : "bg-red-100 text-red-800 dark:bg-red-800 dark:text-red-100"
              }`}
            >
              {message}
            </div>
          )}

          {/* Two Column Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6 ">
            {/* My Attendance Section */}
            <div className="bg-gradient-to-r from-blue-800 to-blue-600 rounded-lg shadow-lg text-white">
              <div className="px-6 py-4 flex justify-between items-center">
                <h3 className="text-lg font-semibold">My Attendance</h3>
                <button
                  onClick={handleTimeAction}
                  disabled={isButtonDisabled()}
                  className={`${
                    !timeInOut.timeIn
                      ? "bg-white text-blue-600 hover:bg-gray-100 cursor-pointer"
                      : !timeInOut.timeOut
                      ? "bg-gray-800 hover:bg-gray-700 cursor-pointer"
                      : "bg-gray-600 cursor-not-allowed"
                  } px-4 py-2 rounded text-sm font-medium`}
                >
                  {getButtonText()}
                </button>
              </div>
              <div className="">
                <div className="bg-white rounded-lg">
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Date
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Time In
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Time Out
                          </th>
                        </tr>
                      </thead>
                <tbody className="bg-white divide-y divide-gray-200">
  {currentRecords.slice(0, 10).map((record) => (
    <tr key={record.id}>
      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
        {new Date(record.date).toLocaleDateString(
          "en-US",
          {
            month: "2-digit",
            day: "2-digit",
            year: "numeric",
          }
        )}
      </td>
      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
        {record.timeIn || "-"}
      </td>
      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
        {record.timeOut || "-"}
      </td>
    </tr>
  ))}
  {/* Fill empty rows to maintain consistent height when less than 10 records */}
  {Array.from({
    length: Math.max(0, 10 - currentRecords.length),
  }).map((_, index) => (
    <tr key={`empty-${index}`}>
      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
        -
      </td>
      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
        -
      </td>
      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
        -
      </td>
    </tr>
  ))}
</tbody>
                    </table>
                  </div>

                  {/* Pagination - Show only if more than 10 records */}
                  {userRecords.length > 10 && (
                    <div className="bg-gray-50 px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
                      <div className="flex-1 flex justify-between sm:hidden">
                        <button
                          onClick={() =>
                            setCurrentPage(Math.max(1, currentPage - 1))
                          }
                          disabled={currentPage === 1}
                          className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
                        >
                          Previous
                        </button>
                        <button
                          onClick={() =>
                            setCurrentPage(
                              Math.min(totalPages, currentPage + 1)
                            )
                          }
                          disabled={currentPage === totalPages}
                          className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
                        >
                          Next
                        </button>
                      </div>
                      <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                        <div>
                          <p className="text-sm text-gray-700">
                            Showing{" "}
                            <span className="font-medium">
                              {Math.min(
                                indexOfFirstRecord + 1,
                                userRecords.length
                              )}
                            </span>{" "}
                            to{" "}
                            <span className="font-medium">
                              {Math.min(indexOfLastRecord, userRecords.length)}
                            </span>{" "}
                            of{" "}
                            <span className="font-medium">
                              {Math.min(userRecords.length, 100)}
                            </span>{" "}
                            results
                          </p>
                        </div>
                        <div>
                          <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                            <button
                              onClick={() =>
                                setCurrentPage(Math.max(1, currentPage - 1))
                              }
                              disabled={currentPage === 1}
                              className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                            >
                              Previous
                            </button>
                            {Array.from(
                              { length: totalPages },
                              (_, i) => i + 1
                            ).map((page) => (
                              <button
                                key={page}
                                onClick={() => setCurrentPage(page)}
                                className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                                  currentPage === page
                                    ? "z-10 bg-indigo-50 border-indigo-500 text-indigo-600"
                                    : "bg-white border-gray-300 text-gray-500 hover:bg-gray-50"
                                }`}
                              >
                                {page}
                              </button>
                            ))}
                            <button
                              onClick={() =>
                                setCurrentPage(
                                  Math.min(totalPages, currentPage + 1)
                                )
                              }
                              disabled={currentPage === totalPages}
                              className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                            >
                              Next
                            </button>
                          </nav>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Leave Credits Section */}
            <div className="bg-gradient-to-r from-blue-800 to-blue-600 rounded-lg shadow-lg text-white h-[49%] ">
              <div className="px-6 py-4 flex justify-between items-center">
                <h3 className="text-lg font-semibold">Leave Credits</h3>
                <button className="bg-white text-blue-600 hover:bg-gray-100 cursor-pointer  px-4 py-2 rounded text-sm font-medium">
                  Apply
                </button>
              </div>
              <div className="">
                <div className="bg-white rounded-lg">
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Leaves
                          </th>
                          <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Credits
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        <tr>
                          <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                            Vacation
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900 text-right">
                            7
                          </td>
                        </tr>
                        <tr>
                          <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                            Sick
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900 text-right">
                            5
                          </td>
                        </tr>
                        <tr>
                          <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                            Bereavement
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900 text-right">
                            3
                          </td>
                        </tr>
                        <tr>
                          <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                            Emergency Leave
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900 text-right">
                            2
                          </td>
                        </tr>
                        <tr>
                          <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                            Offset Leave
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900 text-right">
                            0
                          </td>
                        </tr>
                        <tr>
                          <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                            Compensatory Time Off
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900 text-right">
                            0
                          </td>
                        </tr>
                        {/* Fill empty rows to make it 10 rows total */}
                      </tbody>
                    </table>
                  </div>

                  {/* Pagination for Leave Credits */}
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
