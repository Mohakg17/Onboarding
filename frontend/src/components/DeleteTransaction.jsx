import React from "react";
import { RiDeleteBinLine } from "react-icons/ri";
import toast from "react-hot-toast";

const DeleteTransaction = ({ transactionId, refreshTransactions }) => {
  const handleDelete = async () => {
    try {
      const res = await fetch(
        `${
          import.meta.env.VITE_APP_SERVER_DOMAIN
        }/api/transactions/deleteTransaction/${transactionId}`,
        {
          method: "DELETE",
        }
      );

      if (res.ok) {
        refreshTransactions();
        toast.success("Transaction deleted successfully!");
      } else {
        console.error("Failed to delete transaction");
      }
    } catch (err) {
      console.error("Error deleting transaction:", err);
    }
  };

  return (
    <button onClick={handleDelete} className="hover:bg-white rounded-full p-4">
      <RiDeleteBinLine />
    </button>
  );
};

export default DeleteTransaction;
