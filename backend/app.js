const express = require("express");
const dotenv = require("dotenv");
const transactionRouter = require("./routes/transactions");
const cors = require("cors");


dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());  

app.use("/api/transactions", transactionRouter);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
