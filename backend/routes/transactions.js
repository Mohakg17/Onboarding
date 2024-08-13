const express = require("express");

const multer = require("multer");
const upload = multer({ dest: "../uploads" });

const {
  addTransaction,
  editTransaction,
  deleteTransaction,
  getPaginatedTransactions,
  getSingleTransaction,
  uploadCSV,
} = require("../controllers/transactions");
const router = express.Router();

router.route("/addTransaction").post(addTransaction);
router.route("/editTransactions/:id").put(editTransaction);
router.route("/deleteTransaction/:id").delete(deleteTransaction);
router.route("/getPaginatedTransactions").get(getPaginatedTransactions);
router.route("/getSingleTransaction/:id").get(getSingleTransaction);
router.post("/uploadCSV", upload.single("file"), uploadCSV);

module.exports = router;
