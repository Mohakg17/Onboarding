# Onboarding Project-Zluri
Build a CSV upload, parser and APIs.Using Node.js an React.js build a simple system that can upload a given CSV file, parse the fields and stores them appropriately inside a Database. The same data should be viewable / editable via APIs.

## Video Demonstration -
https://github.com/user-attachments/assets/bcd650af-b129-4739-8b0e-7d5b2b89a756

## Some Images-
![Screenshot (7)](https://github.com/user-attachments/assets/cdd235d7-c151-4645-9172-d76d9f4375be)
![Screenshot (3)](https://github.com/user-attachments/assets/60195f14-3f2a-449d-b3fc-90079a02bddc)

## API'S-

### 1. Add Transaction

Endpoint: POST /api/transactions/addTransaction

Description: Adds a new transaction record to the database.

Feature: Ensures that only valid transactions (positive and non-zero amounts) are added. Converts the transaction amount from the specified currency to INR based on the provided date using historical exchange rates.

### 2. Edit Transaction

Endpoint: PUT /api/transactions/editTransaction/:id

Description: Updates an existing transaction record identified by its id.

Feature: Updates an existing transaction’s details and recalculates the amount in INR using the latest exchange rate for the given date.

### 3. Delete Transaction

Endpoint: DELETE /api/transactions/deleteTransaction/:id

Description: Deletes a transaction record identified by its id.

Feature: Removes a specific transaction from the database, ensuring the transaction exists before deletion.

### 4. Get Paginated Transactions

Endpoint: GET /api/transactions/getPaginatedTransactions

Description: Retrieves a paginated list of transactions.

Feature: Supports pagination to efficiently handle large datasets by using LIMIT and OFFSET. Results are sorted by transaction date and id in descending order.

### 5. Get Single Transaction

Endpoint: GET /api/transactions/getSingleTransaction/:id

Description: Retrieves a single transaction identified by its id.

Feature: Provides detailed information for a specific transaction, allowing users to view individual records.

### 6. Upload CSV

Endpoint: POST /api/transactions/uploadCSV

Description: Uploads a CSV file containing multiple transactions and inserts them into the database.

Feature: Allows bulk insertion of transactions from a CSV file. Validates and converts transaction amounts based on current exchange rates and skips invalid records.


## Contact

If you have any questions or suggestions, feel free to contact me at  [Mohak Goyal](manmps17@gmail.com).
