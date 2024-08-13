import React, { useState } from "react";
import currencies from "../constant/constants";
import toast from "react-hot-toast";

const AddTransactionModal = ({ isOpen, onClose, refreshTransactions }) => {
  const [form, setForm] = useState({
    transaction_date: "",
    description: "",
    amount: "",
    currency: "",
  });

  const [errorMessage, setErrorMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false); // State to track if the form is being submitted

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
    setErrorMessage("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Disable the button after form submission starts
    setIsSubmitting(true);

    const today = new Date().toISOString().split("T")[0];

    if (form.transaction_date > today) {
      setErrorMessage("The date cannot be in the future.");
      setIsSubmitting(false); // Re-enable button on error
      return;
    }
    if (form.amount < 0) {
      setErrorMessage("Amount cannot be negative.");
      setIsSubmitting(false); // Re-enable button on error
      return;
    }
    if (form.amount == 0) {
      setErrorMessage("Amount cannot be zero.");
      setIsSubmitting(false); // Re-enable button on error
      return;
    }
    setErrorMessage("");

    try {
      const res = await fetch(
        `${import.meta.env.VITE_APP_SERVER_DOMAIN}/api/transactions/addTransaction`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(form),
        }
      );

      if (res.ok) {
        refreshTransactions();
        toast.success("Transaction added successfully!");
        onClose();
      } else {
        console.error("Failed to add transaction");
      }
    } catch (err) {
      console.error("Error adding transaction:", err);
    } finally {
      // Re-enable the button after operation completes
      setIsSubmitting(false);
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
          <h2 className="text-xl mb-4 bg-white text-black p-4 border-b border-gray-200">
            Add Transaction
          </h2>
          <form onSubmit={handleSubmit} className="max-w-lg mx-auto p-6 bg-white shadow-md rounded-lg">
            <div className="mb-6">
              <input
                type="date"
                name="transaction_date"
                value={form.transaction_date}
                onChange={handleChange}
                className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
                required
              />
            </div>
            <div className="mb-6">
              <input
                type="text"
                name="description"
                id="description"
                value={form.description}
                onChange={handleChange}
                placeholder="Transaction Description"
                className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
                required
              />
            </div>
            <div className="mb-6">
              <select
                name="currency"
                value={form.currency}
                onChange={handleChange}
                className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
                required
              >
                <option value="" disabled>Select currency</option>
                {currencies.map((currency) => (
                  <option key={currency} value={currency}>
                    {currency}
                  </option>
                ))}
              </select>
            </div>
            <div className="mb-6">
              <input
                type="number"
                name="amount"
                value={form.amount}
                onChange={handleChange}
                placeholder="Original Amount"
                className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
                required
              />
            </div>
            {errorMessage && (
              <div className="text-red-500 text-sm mb-6">{errorMessage}</div>
            )}
            <div className="flex justify-end">
              <button
                type="button"
                onClick={onClose}
                className="mr-4 p-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className={`p-3 ${isSubmitting ? 'bg-blue-300 cursor-not-allowed' : 'bg-blue-500 hover:bg-blue-700'} text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500`}
              >
                Add
              </button>
            </div>
          </form>
        </div>
      </div>
    )
  );
};

export default AddTransactionModal;
