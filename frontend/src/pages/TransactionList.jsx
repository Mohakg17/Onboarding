import React, { useState, useEffect } from "react";
import AddTransactionModal from "../components/AddTransactionModal";
import EditTransactionModal from "../components/EditTransactionModal";
import DeleteTransaction from "../components/DeleteTransaction";
import UploadCSVModal from "../components/UploadCSVModal";
import { MdOutlineEdit } from "react-icons/md";
import { LiaRupeeSignSolid } from "react-icons/lia";
import { FaArrowLeft, FaArrowRight } from "react-icons/fa";

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
        `${import.meta.env.VITE_APP_SERVER_DOMAIN}/api/transactions/getPaginatedTransactions?page=${page}`
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
    console.log(transactionId);
    try {
      const res = await fetch(
        `${import.meta.env.VITE_APP_SERVER_DOMAIN}/api/transactions/getSingleTransaction/${transactionId}`
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

  const handleNextPage = () => setPage((prev) => prev + 1);
  const handlePrevPage = () => setPage((prev) => (prev > 1 ? prev - 1 : 1));
  const setPageTo1 = () => {
    setPage(() => 1);
    fetchTransactions();
  };

  const handlePageChange = (event) => {
    const newPage = parseInt(event.target.value, 10);
    if (!isNaN(newPage) && newPage > 0) {
      setPage(newPage);
    }
  };

  return (
    <div className="p-4 text-sm">
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
      <div className="flex flex-col h-full">
        <div className="flex flex-col flex-grow">
          <div className="flex justify-between bg-slate-150 border border-gray-200 p-2 bg-white">
            <h1 className="text-black-500 text-xl font-bold">All Transactions</h1>
            <div className="flex space-x-2">
              <button
                onClick={() => setIsAddModalOpen(true)}
                className="px-8 bg-blue-500 text-white rounded hover:bg-blue-900 py-2 font-bold"
              >
                ADD NEW TRANSACTION
              </button>
              <button
                onClick={() => setIsCSVModalOpen(true)}
                className="px-8 bg-blue-500 text-white rounded hover:bg-blue-900 py-2 font-bold"
              >
                UPLOAD CSV
              </button>
            </div>
          </div>
          <div className="flex-grow overflow-auto">
            <table className="bg-white border border-gray-100 shadow-2xl w-full text-left mt-4">
              <thead className="bg-white">
                <tr>
                  <th className="border-b border-gray-200 px-6 text-left font-bold py-4">Date</th>
                  <th className="border-b border-gray-200 px-6 text-left font-bold min-w-[300px] py-4">Name</th>
                  <th className="border-b border-gray-200 px-6 text-left font-bold py-4">Amount</th>
                  <th className="border-b border-gray-200 px-6 text-left font-bold py-4">Amount (INR)</th>
                  <th className="border-b border-gray-200 min-w-[200px] text-left"></th>
                </tr>
              </thead>
              <tbody>
                {transactions.map((transaction) => (
                  <tr key={transaction.id} className="relative group transition duration-200 ease-in">
                    <td className="border-b border-gray-200 px-4 py-4">{transaction.transaction_date}</td>
                    <td className="border-b border-gray-200 px-4 py-4 max-w-[100px] truncate pr-10">{transaction.description}</td>
                    <td className="border-b border-gray-200 px-4 py-4">
                      <div className="flex items-center">
                        <span className="mr-1">{transaction.currency}</span>
                        <span>{transaction.amount}</span>
                      </div>
                    </td>
                    <td className="border-b border-gray-200 px-4 py-4">
                      <div className="flex items-center">
                        <span className="ml-1">
                          <LiaRupeeSignSolid />
                        </span>
                        <span>{transaction.amountininr}</span>
                      </div>
                    </td>
                    <td className="border-b border-gray-200 px-4 py-4">
                      {selectedTransactions.length < 1 && (
                        <div className="flex space-x-10 absolute right-[50px] top-1/2 transform -translate-y-1/2 opacity-0 group-hover:opacity-90 transition-opacity">
                          <button onClick={() => fetchTransactionById(transaction.id)} className="hover:bg-white rounded-full p-4">
                            <MdOutlineEdit />
                          </button>
                          <DeleteTransaction transactionId={transaction.id} refreshTransactions={fetchTransactions} />
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
        <div className="bg-slate-150 border border-gray-200 p-2 bg-white mt-4 flex justify-end">
          <div className="flex items-center space-x-2">
          <div className="flex items-center space-x-2">
              <span className="font-bold">Page</span>
              <input
                type="number"
                value={page}
                onChange={handlePageChange}
                min="1"
                className="w-16 text-center border border-gray-300 rounded p-1"
              />
            </div>
            <button
              onClick={handlePrevPage}
              disabled={page === 1}
              className="py-1 px-4 bg-gray-300 rounded mr-2 hover:bg-gray-400 flex items-center justify-center"
            >
              <FaArrowLeft className="text-gray-800" />
            </button>
           
            <button
              onClick={handleNextPage}
              className="py-1 px-4 bg-gray-300 rounded hover:bg-gray-400 font-bold flex items-center justify-center"
            >
              <FaArrowRight className="text-gray-800" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TransactionList;
