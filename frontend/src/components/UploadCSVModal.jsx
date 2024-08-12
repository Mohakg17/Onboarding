import React, { useState } from "react";

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
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-purple-500 mx-auto"></div>
          <p className="mt-4 text-purple-500">Uploading...</p>
        </div>
      );
      break;
    case "success":
      statusContent = (
        <div className="text-center">
          <div className="text-green-500">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-8 w-8 mx-auto"
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
          <p className="mt-4 text-green-500">Upload Successful!</p>
          <p>{file.name}</p>
          <button
            onClick={() => {
              onClose();
              setUploadStatus("idle");
            }}
            className="mt-4 px-4 py-2 bg-purple-500 text-white rounded hover:bg-purple-600"
          >
            Done
          </button>
        </div>
      );
      break;
    case "failure":
      statusContent = (
        <div className="text-center">
          <div className="text-red-500">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-8 w-8 mx-auto"
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
          <p className="mt-4 text-red-500">Upload Failed!</p>
          <p>{file.name}</p>
          <button
            onClick={() => {
              setUploadStatus("idle");
            }}
            className="mt-4 px-4 py-2 bg-purple-500 text-white rounded hover:bg-purple-600"
          >
            Retry
          </button>
        </div>
      );
      break;
    default:
      statusContent = (
        <div className="mt-4 flex justify-end">
          <button
            onClick={onClose}
            className="mr-2 px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
          >
            Cancel
          </button>
          <button
            onClick={handleUpload}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Upload
          </button>
        </div>
      );
  }

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-50">
      <div className="bg-white p-4 rounded shadow-lg w-96">
        <h2 className="text-xl mb-4">Upload CSV</h2>
        {uploadStatus === "idle" && (
          <input type="file" accept=".csv" onChange={handleFileChange} />
        )}
        {statusContent}
      </div>
    </div>
  );
};

export default UploadCSVModal;
