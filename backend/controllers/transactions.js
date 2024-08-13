// transactionController.js

const fs = require("fs");
const Papa = require("papaparse");
const db = require("../config/db");
const fetchConversion_rates = require("../utils/fetchConversion_rates");
const currencyExchangeByDate = require("../utils/currencyExchangeByDate");

// Controller function to add a new transaction
const addTransaction = async (req, res) => {
  try {
    // console.log(req);
    const { transaction_date, description, amount, currency } = req.body;
    if (amount < 0) {
      throw new Error("amount not be negative");
    }
    // let curr1ToCurr2 = await currencyExchangeByDate(transaction_date, currency);
    let curr1ToCurr2 = await fetchConversion_rates();
    // console.log(curr1ToCurr2)
    const convertedAmount = curr1ToCurr2[currency];
    // console.log(amount, amount / convertedAmount, "check");
    const amountInINR = amount / convertedAmount;
    // const amountInINR = amountInEUR * curr1ToCurr2.INR;
    // console.log(typeof transaction_date, transaction_date);
    // Insert query to add a new transaction
    const query = `
      INSERT INTO transactions (transaction_date, description, amount, currency, amountInINR)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING *;`;

    // Execute the query with parameters
    const result = await db.query(query, [
      transaction_date,
      description,
      amount,
      currency,
      amountInINR,
    ]);

    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error("Error adding transaction:", err);
    res.status(500).json({ error: "Failed to add transaction" });
    return;
  }
};

// Controller function to edit a transaction
const editTransaction = async (req, res) => {
  try {
    const { id } = req.params; // Extract transaction ID from URL parameters
    // console.log(id);
    const { transaction_date, description, amount, currency } = req.body;

    let curr1ToCurr2 = await currencyExchangeByDate(transaction_date, currency);
    const convertedAmount = curr1ToCurr2[currency];
    // console.log(amount, amount / convertedAmount, "check");
    const amountInEUR = amount / convertedAmount;
    const amountInINR = amountInEUR * curr1ToCurr2.INR;
    // Update query to edit an existing transaction
    const query = `
      UPDATE transactions
      SET transaction_date = $1, description = $2, amount = $3, currency = $4, amountInINR =$5
      WHERE id = $6
      RETURNING *;`;

    // Execute the query with parameters
    const result = await db.query(query, [
      transaction_date,
      description,
      amount,
      currency,
      amountInINR,
      id,
    ]);

    // Check if a transaction was updated
    if (result.rows.length > 0) {
      res.json(result.rows[0]); // Return the updated transaction data
    } else {
      res.status(404).json({ error: "Transaction not found" });
    }
  } catch (err) {
    console.error("Error editing transaction:", err);
    res.status(500).json({ error: "Failed to edit transaction" });
  }
};

// Controller function to delete a transaction
const deleteTransaction = async (req, res) => {
  try {
    const { id } = req.params; // Extract transaction ID from URL parameters

    // Execute the query with the transaction ID
    const result = await db.query(`
      DELETE FROM transactions
      WHERE id = ${id}
      RETURNING *;`);

    // Check if a transaction was deleted
    if (result.rows.length > 0) {
      res.json({
        message: "Transaction deleted successfully",
        transaction: result.rows[0],
      }); // Return the deleted transaction data
    } else {
      res.status(404).json({ error: "Transaction not found" });
    }
  } catch (err) {
    console.error("Error deleting transaction:", err);
    res.status(500).json({ error: "Failed to delete transaction" });
  }
};

// Controller function to get paginated transactions
const getPaginatedTransactions = async (req, res) => {
  try {
    const { page = 1 } = req.query;
    const transactionsPerPage = process.env.PAGINATION_SIZE;
    const offset = (page - 1) * transactionsPerPage;

    // Query to fetch transactions with pagination and sorting
    const query = `
      SELECT *
      FROM transactions
      ORDER BY transaction_date ASC, id ASC
      LIMIT $1 OFFSET $2;`;

    const result = await db.query(query, [transactionsPerPage, offset]);

    if (result.rows.length > 0) {
      res.json(result.rows);
    } else {
      res.status(404).json({ error: "No transactions found" });
    }
  } catch (err) {
    console.error("Error fetching transactions:", err);
    res.status(500).json({ error: "Failed to fetch transactions" });
  }
};

const getSingleTransaction = async (req, res) => {
  const { id } = req.params;

  try {
    const query = "SELECT * FROM transactions WHERE id = $1";
    const result = await db.query(query, [id]);

    if (result.rows.length > 0) {
      res.json(result.rows[0]);
    } else {
      res.status(404).json({ error: "Transaction not found" });
    }
  } catch (err) {
    console.error("Error fetching transaction:", err);
    res.status(500).json({ error: "Failed to fetch transaction" });
  }
};
const parseAndSortCSV = (fileContent) => {
  // const fileContent = fs.readFileSync(filePath, 'utf8');

  // Split content into lines
  const lines = fileContent.split('\n').filter(line => line.trim() !== '');

  // Get the headers and rows
  const headers = lines[0].split(',');
  const rows = lines.slice(1).map(line => {
    const values = line.split(',');
    const rowObject = {};
    headers.forEach((header, index) => {
      rowObject[header.trim()] = values[index] ? values[index].trim() : null;
    });
    return rowObject;
  });

  // Sort the rows by date (assuming the date is in DD-MM-YYYY format)
  rows.sort((a, b) => {
    const dateA = new Date(a['Date'].split('-').reverse().join('-'));
    const dateB = new Date(b['Date'].split('-').reverse().join('-'));
    return dateB - dateA;
  });

  return rows;
};

const uploadCSV = async (req, res) => {
  // console.log(req.file);
  const filePath = req.file.path;

  try {
    // Read the uploaded CSV file
    const fileContent = fs.readFileSync(filePath, "utf8");
  //  console.log(fileContent)
    // Parse CSV data
    // const results = Papa.parse(fileContent, { header: true });
    const results=parseAndSortCSV(fileContent);
    const transactions = results;
    // console.log(results);
    // transactions.sort((a, b) => {
    //   const dateA = new Date(a.Date.split("-").reverse().join("-"));
    //   const dateB = new Date(b.Date.split("-").reverse().join("-"));
    //   return dateB - dateA;
    // });
    await db.query("BEGIN");

    const queryText = `
      INSERT INTO transactions (transaction_date, description, amount, currency, amountInINR)
      VALUES ($1, $2, $3, $4, $5)
    `;

    let c1ToC2 = await fetchConversion_rates();

    // console.log(curr1ToCurr2.USD);

    // let countOfEmptyFields = 0;
    const validCurrencies = Object.keys(c1ToC2);
    const today = new Date();

    for (const transaction of transactions) {
      const { Description, Currency } = transaction;
      // if (countOfEmptyFields >= 1) {
      //   throw new Error("Validation failed.");
      // }

      if (
        !transaction.Date ||
        !transaction.Amount ||
        !transaction.Description ||
        !transaction.Currency
      ) {
        console.warn("Skipping invalid transaction with no description:", transaction);
        // countOfEmptyFields += 1;
        // if (countOfEmptyFields > 1) {
        //   throw new Error("Validation failed.");
        // }
        continue; // Skip this transaction and move to the next one
      }

      const transactionDate = transaction.Date.split("-").reverse().join("-"); // DD-MM-YYYY to YYYY-MM-DD
      // console.log(transactionDate,typeof transactionDate)

      const transaction_Date = new Date(transactionDate);
      // console.log(today, transaction_Date);
      if (
        transaction_Date.toString() === "Invalid Date" ||
        transaction_Date > today
      ) {
        console.warn(
          "Skipping transaction with invalid or future date:",
          transaction
        );
        // countOfEmptyFields += 1;
        // if (countOfEmptyFields > 1) {
        //   throw new Error("Validation failed.");
        // }
        continue;
      }

      if (!validCurrencies.includes(Currency)) {
        console.warn(
          "Skipping transaction with invalid currency:",
          transaction
        );
        // countOfEmptyFields += 1;
        // if (countOfEmptyFields > 1) {
        //   throw new Error("Validation failed.");
        // }
        continue;
      }
      if (Description.trim() === "") {
        console.warn(
          "Skipping transaction with empty description:",
          transaction
        );
        // countOfEmptyFields += 1;
        // if (countOfEmptyFields > 1) {
        //   throw new Error("Validation failed.");
        // }
        continue;
      }
// console.log(transaction_Date,typeof transaction_Date)
// console.log(Currency,typeof Currency)
      // let curr1ToCurr2 = await currencyExchangeByDate(transactionDate, Currency);
        
      // console.log(curr1ToCurr2)

      // console.log(transactionDate);

      const amount = parseFloat(transaction.Amount);
      if (amount < 0) {
        console.warn(
          "Skipping transaction with invalid amount:",
          transaction
        );
        continue;
      }

      // console.log(Description);
      const convertedAmount = c1ToC2[Currency];
      // console.log(amount, amount / convertedAmount);
      const amountInINR = (amount / convertedAmount).toFixed(3);
      // const amountInINR = amountInEUR * curr1ToCurr2.INR;

      // console.log(amount,amountInINR);
      await db.query(queryText, [
        transactionDate,
        Description,
        amount,
        Currency,
        amountInINR,
      ]);
    }

    // console.log(countOfEmptyFields);
    // if (countOfEmptyFields <= 1) {
      await db.query("COMMIT");
    // }
    res.status(200).json({ message: "CSV data uploaded successfully" });
  } catch (e) {
    await db.query("ROLLBACK");
    console.error("Error inserting CSV data:", e);
    res.status(500).json({ error: e });
    return;
  } finally {
    // Delete the file after parsing and database operations
    fs.unlink(filePath, (unlinkErr) => {
      if (unlinkErr) console.error("Error deleting CSV file:", unlinkErr);
    });
  }
};

// const deleteTransactionMultiple = async (req, res) => {
//   const { transactionIds } = req.body;

//   if (!Array.isArray(transactionIds) || transactionIds.length === 0) {
//     return res.status(400).json({ error: "Invalid transaction IDs" });
//   }

//   const queryText = "DELETE FROM transactions WHERE id = ANY($1)";

//   try {
//     await db.query(queryText, [transactionIds]);
//     res.status(200).json({ message: "Transactions deleted successfully" });
//   } catch (err) {
//     console.error("Error deleting transactions:", err);
//     res.status(500).json({ error: "Failed to delete transactions" });
//   }
// };

module.exports = {
  addTransaction,
  editTransaction,
  deleteTransaction,
  getPaginatedTransactions,
  getSingleTransaction,
  uploadCSV,
  // deleteTransactionMultiple,
};
