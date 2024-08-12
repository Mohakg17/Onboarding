import React, { useState, useEffect } from "react";
import AddTransactionModal from "../components/AddTransactionModal";
import EditTransactionModal from "../components/EditTransactionModal";
import DeleteTransaction from "../components/DeleteTransaction";
import UploadCSVModal from "../components/UploadCSVModal";
import { MdOutlineEdit } from "react-icons/md";
import { LiaRupeeSignSolid, LiaDollarSignSolid } from "react-icons/lia";

const TransactionList = () => {
  const [transactions, setTransactions] = useState([]);
  const [page, setPage] = useState(1);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isCSVModalOpen, setIsCSVModalOpen] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState(null);
  const [selectedTransactions, setSelectedTransactions] = useState([]);

  const fetchTransactions = async () => {
    try {
      const res = await fetch(
        `${
          import.meta.env.VITE_APP_SERVER_DOMAIN
        }/api/transactions/getPaginatedTransactions?page=${page}`
      );

      if (!res.ok) {
        throw new Error("Network response was not ok");
      }

      const data = await res.json();
      setTransactions(data);
    } catch (err) {
      console.error("Error fetching transactions:", err);
    }
  };

  const fetchTransactionById = async (transactionId) => {
    try {
      const res = await fetch(
        `${
          import.meta.env.VITE_APP_SERVER_DOMAIN
        }/api/transactions/getSingleTransaction/${transactionId}`
      );
      const data = await res.json();
      setEditingTransaction(data);
      setIsEditModalOpen(true);
    } catch (err) {
      console.error("Error fetching transaction:", err);
    }
  };

  useEffect(() => {
    fetchTransactions();
  }, [page]);

  // useEffect(() => {
  //   console.log(selectedTransactions);
  // }, [selectedTransactions]);

  const handleNextPage = () => setPage((prev) => prev + 1);
  const handlePrevPage = () => setPage((prev) => (prev > 1 ? prev - 1 : 1));
  const setPageTo1 = () => {
    setPage(() => 1);
    fetchTransactions();
  };

  const handleCheckboxChange = (transactionId) => {
    // console.log(selectedTransactions);

    setSelectedTransactions((prevSelected) =>
      prevSelected.includes(transactionId)
        ? prevSelected.filter((id) => id !== transactionId)
        : [...prevSelected, transactionId]
    );
    // console.log(selectedTransactions);
  };

  const handleDeleteSelected = async () => {
    try {
      const res = await fetch(
        `${
          import.meta.env.VITE_APP_SERVER_DOMAIN
        }/api/transactions/deleteTransaction`,
        {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ transactionIds: selectedTransactions }),
        }
      );

      if (res.ok) {
        fetchTransactions();
        setSelectedTransactions([]);
      } else {
        console.error("Failed to delete transactions");
      }
    } catch (err) {
      console.error("Error deleting transactions:", err);
    }
  };

  return (
    <div className="container mx-auto p-4 text-sm">
      <AddTransactionModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        refreshTransactions={fetchTransactions}
      />
      <EditTransactionModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        transaction={editingTransaction}
        refreshTransactions={fetchTransactions}
      />
      <UploadCSVModal
        isOpen={isCSVModalOpen}
        onClose={() => setIsCSVModalOpen(false)}
        refreshTransactions={fetchTransactions}
        setPageTo1={setPageTo1}
      />
      <div className="flex justify-center ">
        <div className="">
          <div className="flex-col items-center justify-center min-w-full ">
            <div className="flex justify-between bg-slate-150 border-solid border border-gray-200 max-w-[1000px] p-1 px-2">
              <h1 className=" text-gray-500 flex items-center text-xl font-normal">
                Transactions
              </h1>
              <div className="flex space-x-2">
                <button
                  onClick={() => setIsCSVModalOpen(true)}
                  className="px-4 text-purple-600 border-2 font-bold rounded "
                >
                  UPLOAD CSV
                </button>
                <button
                  onClick={() => setIsAddModalOpen(true)}
                  className="px-8 bg-blue-700 text-white rounded hover:bg-blue-900 py-2 "
                >
                  ADD TRANSACTION
                </button>
              </div>
            </div>
            <table className=" bg-white border border-gray-100 shadow-2xl ">
              <thead className="bg-gray-200 ">
                <tr>
                  <th className="px-4 py-4 border-b-2">
                    <input
                      type="checkbox"
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedTransactions(
                            transactions.map((t) => t.id)
                          );
                        } else {
                          setSelectedTransactions([]);
                        }
                      }}
                      checked={
                        selectedTransactions.length === transactions.length
                      }
                    />
                  </th>
                  <th className="px-4 text-left font-medium py-4 border-b-2">
                    Date
                  </th>
                  <th className="px-4 text-left font-medium min-w-[300px] py-4 border-b-2">
                    Description
                  </th>
                  <th className="px-4 text-left font-medium py-4 border-b-2">
                    Original Amount
                  </th>
                  <th className="px-4 text-left font-medium py-4 border-b-2">
                    Amount in INR
                  </th>
                  <th className="px-4 min-w-[200px] text-left py-4 border-b-2">
                    {selectedTransactions.length > 0 && (
                      <button
                        onClick={handleDeleteSelected}
                        className="px-4 bg-red-500 text-white rounded hover:bg-red-600 "
                      >
                        DELETE SELECTED
                      </button>
                    )}
                  </th>
                </tr>
              </thead>
              <tbody>
                {transactions.map((transaction) => (
                  <tr
                    key={transaction.id}
                    className="relative group transition duration-200 ease-in hover:scale-105 hover:bg-slate-200"
                  >
                    {/* {console.log(transaction.amount)} */}
                    <td className="px-4 py-4 border-b">
                      <input
                        type="checkbox"
                        checked={selectedTransactions.includes(transaction.id)}
                        onChange={() => handleCheckboxChange(transaction.id)}
                      />
                    </td>
                    <td className="px-4 py-4 border-b">
                      {transaction.transaction_date
                        .split("-")
                        .reverse()
                        .join("-")}
                    </td>
                    <td className="px-4 py-4 border-b max-w-[100px] truncate pr-10">
                      {transaction.description}
                    </td>
                    <td className="px-4 py-4 border-b">
                      <div className="flex items-center">
                        <span className="mr-1">{transaction.currency}</span>
                        <span>{transaction.amount}</span>
                      </div>
                    </td>
                    <td className="px-4 py-4 border-b">
                      <div className="flex items-center">
                        <span className="ml-1">
                          <LiaRupeeSignSolid />
                        </span>
                        <span>{transaction.amountininr}</span>
                      </div>
                    </td>
                    <td className="px-4 py-4 border-b">
                      {selectedTransactions.length < 1 && (
                        <div className="flex space-x-10 absolute right-[50px] top-1/2 transform -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={() => fetchTransactionById(transaction.id)}
                            className="hover:bg-white rounded-full p-4"
                          >
                            <MdOutlineEdit />
                          </button>
                          <DeleteTransaction
                            transactionId={transaction.id}
                            refreshTransactions={fetchTransactions}
                          />
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="flex justify-between bg-slate-150 bg-white border-solid border border-gray-200 max-w-[1000px] p-2">
              <button
                onClick={handlePrevPage}
                disabled={page === 1}
                className="py-1 px-4 bg-gray-300 rounded mr-2 hover:bg-gray-400"
              >
                Previous
              </button>
              <div className="shadow-2xl bg-slate-200 px-2 py-1">
                Page - {page}
              </div>
              <button
                onClick={handleNextPage}
                className="py-1 px-4 bg-gray-300 rounded hover:bg-gray-400"
              >
                Next
              </button>
            </div>
          </div>
        </div>
      </div>
      <div className="mt-4"></div>
    </div>
  );
};

export default TransactionList;
