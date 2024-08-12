import React, { useState, useEffect } from "react";
import currencies from "../constant/constants";
import toast from "react-hot-toast";

const EditTransactionModal = ({
  isOpen,
  onClose,
  transaction,
  refreshTransactions,
}) => {
  const [form, setForm] = useState({
    transaction_date: "",
    description: "",
    amount: "",
    currency: "",
  });

  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    if (transaction) {
      setForm(transaction);
    }
  }, [transaction]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    console.log(value);
    setForm({ ...form, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const today = new Date().toISOString().split("T")[0];

    if (form.transaction_date > today) {
      setErrorMessage("The date cannot be in the future.");
      return;
    }

    setErrorMessage("");

    try {
      const res = await fetch(
        `${
          import.meta.env.VITE_APP_SERVER_DOMAIN
        }/api/transactions/editTransactions/${transaction.id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(form),
        }
      );

      if (res.ok) {
        refreshTransactions();
        toast.success("Transaction edited successfully!");
        onClose();
      } else {
        console.error("Failed to update transaction");
      }
    } catch (err) {
      console.error("Error updating transaction:", err);
    }
  };

  return (
    isOpen && (
      <div className="fixed z-10 inset-0 flex items-center justify-center bg-black bg-opacity-50">
        <div className="bg-white p-6 rounded-md relative w-96">
          <button
            className="absolute top-2 right-2 text-xl font-bold"
            onClick={onClose}
          >
            &times;
          </button>
          <h2 className="text-xl mb-4">Edit Transaction</h2>
          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label className="block mb-2">Date</label>
              <input
                type="date"
                name="transaction_date"
                value={form.transaction_date}
                onChange={handleChange}
                className="w-full p-2 border"
                required
              />
            </div>
            <div className="mb-4">
              <label className="block mb-2">Description</label>
              <input
                type="text"
                name="description"
                value={form.description}
                onChange={handleChange}
                className="w-full p-2 border"
                required
              />
            </div>
            <div className="mb-4">
              <label className="block mb-2">Amount</label>
              <input
                type="number"
                name="amount"
                value={form.amount}
                onChange={handleChange}
                className="w-full p-2 border"
                required
              />
            </div>
            <div className="mb-4">
              <label className="block mb-2">Currency</label>
              <select
                name="currency"
                value={form.currency}
                onChange={handleChange}
                className="w-full p-2 border"
                required
              >
                <option value="" disabled>
                  Select currency
                </option>
                {currencies.map((currency) => (
                  <option key={currency} value={currency}>
                    {currency}
                  </option>
                ))}
              </select>
            </div>
            {errorMessage && (
              <div className="text-red-500 text-sm mb-4">{errorMessage}</div>
            )}
            <div className="flex justify-end">
              <button
                type="button"
                onClick={onClose}
                className="mr-4 p-2 bg-gray-500 text-white rounded"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="p-2 bg-blue-500 text-white rounded"
              >
                Update
              </button>
            </div>
          </form>
        </div>
      </div>
    )
  );
};

export default EditTransactionModal;
