import React, { useState } from "react";
import { FaTimes } from "react-icons/fa"; // Import the X icon from react-icons

const UploadCSVModal = ({
  isOpen,
  onClose,
  refreshTransactions,
  setPageTo1,
}) => {
  const [file, setFile] = useState(null);
  const [uploadStatus, setUploadStatus] = useState("idle"); // States: idle, uploading, success, failure

  const handleFileChange = (event) => {
    setFile(event.target.files[0]);
  };

  const handleUpload = () => {
    if (file) {
      setUploadStatus("uploading"); // Set state to indicate uploading

      const formData = new FormData();
      formData.append("file", file);

      fetch(
        `${import.meta.env.VITE_APP_SERVER_DOMAIN}/api/transactions/uploadCSV`,
        {
          method: "POST",
          body: formData,
        }
      )
        .then((response) => {
          if (!response.ok) {
            throw new Error("Network response was not ok");
          }
          return response.json();
        })
        .then((data) => {
          if (data.message) {
            setPageTo1(); // Refresh transactions after upload
            setUploadStatus("success"); // Set state to indicate upload success
          } else {
            setUploadStatus("failure"); // Set state to indicate upload failure
            console.error("Error uploading CSV:", data.error);
          }
        })
        .catch((error) => {
          setUploadStatus("failure"); // Set state to indicate upload failure
          console.error("Error uploading CSV:", error);
        });
    }
  };

  if (!isOpen) return null;

  let statusContent;
  switch (uploadStatus) {
    case "uploading":
      statusContent = (
        <div className="text-center">
          <div className="animate-spin rounded-full h-10 w-10 border-t-4 border-b-4 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-blue-600 text-lg font-semibold">Uploading...</p>
        </div>
      );
      break;

    case "success":
      statusContent = (
        <div className="text-center">
          <div className="text-blue-600">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-10 w-10 mx-auto"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M5 13l4 4L19 7"
              />
            </svg>
          </div>
          <p className="mt-4 text-blue-600 text-lg font-semibold">Upload Successful!</p>
          <p className="text-gray-800 mt-2">{file.name}</p>
          <button
            onClick={() => {
              onClose();
              setUploadStatus("idle");
            }}
            className="mt-4 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-400"
          >
            Done
          </button>
        </div>
      );
      break;

    case "failure":
      statusContent = (
        <div className="text-center">
          <div className="text-red-600">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-10 w-10 mx-auto"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </div>
          <p className="mt-4 text-red-600 text-lg font-semibold">Upload Failed!</p>
          <p className="text-gray-800 mt-2">{file.name}</p>
          <button
            onClick={() => {
              setUploadStatus("idle");
            }}
            className="mt-4 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-400"
          >
            Retry
          </button>
        </div>
      );
      break;

    default:
      statusContent = (
        <div className="text-center">
          <input
            type="file"
            accept=".csv"
            onChange={handleFileChange}
            className="w-full p-3 border border-gray-300 rounded-lg text-gray-800 file:border-0 file:bg-blue-600 file:text-white file:rounded-lg file:p-2 file:cursor-pointer hover:file:bg-blue-700"
          />
          <button
            onClick={handleUpload}
            className="mt-4 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-400"
          >
            Upload CSV
          </button>
        </div>
      );
  }

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-70">
      <div className="bg-white p-6 rounded-lg shadow-lg w-96 max-w-sm relative">
        {/* Close icon */}
        <button
          onClick={onClose}
          className="absolute top-2 right-2 text-gray-600 hover:text-gray-800 focus:outline-none"
        >
          <FaTimes className="h-4 w-4" />
        </button>
        {statusContent}
      </div>
    </div>
  );
};

export default UploadCSVModal;
