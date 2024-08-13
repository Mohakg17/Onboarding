

const fs = require("fs");
const db = require("../config/db");
const fetchConversion_rates = require("../utils/fetchConversion_rates");
const currencyExchangeByDate = require("../utils/currencyExchangeByDate");


const addTransaction = async (req, res) => {
  try {
    
    const { transaction_date, description, amount, currency } = req.body;
    if (amount < 0) {
      throw new Error("amount not be negative");
    }
    if (amount == 0) {
      throw new Error("amount not be zero");
    }
    
    let curr1ToCurr2 = await currencyExchangeByDate(transaction_date, currency);
    
    
    const convertedAmount = curr1ToCurr2[currency];
    
    const amountInEUR = amount / convertedAmount;
    const amountInINR = (amountInEUR * curr1ToCurr2.INR).toFixed(3);
    
    
    const query = `
      INSERT INTO transactions (transaction_date, description, amount, currency, amountInINR)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING *;`;
    
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


const editTransaction = async (req, res) => {
  try {
    const { id } = req.params; 
    
    const { transaction_date, description, amount, currency } = req.body;

    let curr1ToCurr2 = await currencyExchangeByDate(transaction_date, currency);
    const convertedAmount = curr1ToCurr2[currency];
    
    const amountInEUR = amount / convertedAmount;
    const amountInINR = (amountInEUR * curr1ToCurr2.INR).toFixed(3);
    
    const query = `
      UPDATE transactions
      SET transaction_date = $1, description = $2, amount = $3, currency = $4, amountInINR =$5
      WHERE id = $6
      RETURNING *;`;

    
    const result = await db.query(query, [
      transaction_date,
      description,
      amount,
      currency,
      amountInINR,
      id,
    ]);

    
    if (result.rows.length > 0) {
      res.json(result.rows[0]); 
    } else {
      res.status(404).json({ error: "Transaction not found" });
    }
  } catch (err) {
    console.error("Error editing transaction:", err);
    res.status(500).json({ error: "Failed to edit transaction" });
  }
};


const deleteTransaction = async (req, res) => {
  try {
    const { id } = req.params; 

    
    const result = await db.query(`
      DELETE FROM transactions
      WHERE id = ${id}
      RETURNING *;`);

    
    if (result.rows.length > 0) {
      
      res.json({
        message: "Transaction deleted successfully",
        transaction: result.rows[0],
      }); 
    } else {
      res.status(404).json({ error: "Transaction not found" });
    }
  } catch (err) {
    console.error("Error deleting transaction:", err);
    res.status(500).json({ error: "Failed to delete transaction" });
  }
};


const getPaginatedTransactions = async (req, res) => {
  try {
    const { page = 1 } = req.query;
    const transactionsPerPage = process.env.PAGINATION_SIZE;
    const offset = (page - 1) * transactionsPerPage;

    
    const query = `
      SELECT *
      FROM transactions
      ORDER BY transaction_date DESC, id DESC
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
  

  
  const lines = fileContent.split('\n').filter(line => line.trim() !== '');

  
  const headers = lines[0].split(',');
  const rows = lines.slice(1).map(line => {
    const values = line.split(',');
    const rowObject = {};
    headers.forEach((header, index) => {
      rowObject[header.trim()] = values[index] ? values[index].trim() : null;
    });
    return rowObject;
  });

  
  
  
  
  
  

  return rows;
};

const uploadCSV = async (req, res) => {
  
  const filePath = req.file.path;

  try {
    
    const fileContent = fs.readFileSync(filePath, "utf8");
  
    
    
    const results=parseAndSortCSV(fileContent);
    const transactions = results;
    
    
    
    
    
    
    await db.query("BEGIN");

    const queryText = `
      INSERT INTO transactions (transaction_date, description, amount, currency, amountInINR)
      VALUES ($1, $2, $3, $4, $5)
    `;

    let c1ToC2 = await fetchConversion_rates();

    

    
    const validCurrencies = Object.keys(c1ToC2);
    const today = new Date();

    for (const transaction of transactions) {
      const { Description, Currency } = transaction;
      
      
      

      if (
        !transaction.Date ||
        !transaction.Amount ||
        !transaction.Description ||
        !transaction.Currency
      ) {
        console.warn("Skipping invalid transaction with no description:", transaction);
        
        
        
        
        continue; 
      }

      const transactionDate = transaction.Date.split("-").reverse().join("-"); 
      

      const transaction_Date = new Date(transactionDate);
      
      if (
        transaction_Date.toString() === "Invalid Date" ||
        transaction_Date > today
      ) {
        console.warn(
          "Skipping transaction with invalid or future date:",
          transaction
        );
        
        
        
        
        continue;
      }

      if (!validCurrencies.includes(Currency)) {
        console.warn(
          "Skipping transaction with invalid currency:",
          transaction
        );
        
        
        
        
        continue;
      }
      if (Description.trim() === "") {
        console.warn(
          "Skipping transaction with empty description:",
          transaction
        );
        
        
        
        
        continue;
      }


      
        
      

      

      const amount = parseFloat(transaction.Amount);
      if (amount < 0) {
        console.warn(
          "Skipping transaction with invalid amount:",
          transaction
        );
        continue;
      }

      
      const convertedAmount = c1ToC2[Currency];
      
      const amountInINR = (amount / convertedAmount).toFixed(3);
      

      
      await db.query(queryText, [
        transactionDate,
        Description,
        amount,
        Currency,
        amountInINR,
      ]);
    }

    
    
      await db.query("COMMIT");
    
    res.status(200).json({ message: "CSV data uploaded successfully" });
  } catch (e) {
    await db.query("ROLLBACK");
    console.error("Error inserting CSV data:", e);
    res.status(500).json({ error: e });
    return;
  } finally {
    
    fs.unlink(filePath, (unlinkErr) => {
      if (unlinkErr) console.error("Error deleting CSV file:", unlinkErr);
    });
  }
};



















module.exports = {
  addTransaction,
  editTransaction,
  deleteTransaction,
  getPaginatedTransactions,
  getSingleTransaction,
  uploadCSV,
  
};
