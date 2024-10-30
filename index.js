const express = require("express");
const QRCode = require("qrcode");
const cors = require("cors");
const mongoose = require("mongoose");

const payment = require("./models/payments.model");
const withdrawl = require("./models/withdrawl.model");
const connectDB = require("./db/db.config");

const app = express();
const PORT = 3000;

// Middleware
app.use(cors()); // Enable CORS if needed
app.use(express.json()); // to handle JSON payloads

app.set("view engine", "ejs");

app.post("/withdrawl", async (req, res) => {
  try {
    console.log(req.body);
    const status = "pending";
    req.body.status = status;
    req.body.time = new Date().toLocaleString();
    // Create a new payment document in the database
    const withdrawlResult = await withdrawl.create({
      playerId: req.body.id,
      amount: req.body.amount,
      time: req.body.time,
      status: req.body.status,
    });
    // Send a success response back to the client
    return res.json({
      message: "Withdrawl request received successfully",
      // data: withdrawlResult,
    });
  } catch (err) {
    return res
      .status(500)
      .json({
        message: "An error occurred while processing withdrawl",
        error: err.message,
      });
  }
});

// Payment endpoint to handle payment data from the client
app.post("/payment", async (req, res) => {
  req.body.status = "pending";

  // Log the request body to see the data sent by the client
  // console.log(req.body); // This will print the incoming POST data

  try {
    const paymentResult = await payment.create({
      playerId: req.body.idNumber,
      amount: req.body.amount,
      utr: req.body.utrNumber,
      time: req.body.time,
      status: req.body.status,
    });

    // console.log(paymentResult);

    // Send a success response back to the client
    return res.json({
      message: "Payment received successfully",
      data: paymentResult,
    });
  } catch (err) {
    // console.error(err); // Log the error to the console for debugging
    // Send an error response back to the client
    return res
      .status(500)
      .json({
        message: "An error occurred while processing payment",
        error: err.message,
      });
  }
});

// update status on the basis of id and status
app.get("/updatestatus", async (req, res) => {
  const { id, status, amount } = req.query;
  console.log(
    `Updating status for PlayerID: ${req.query.id}, Status: ${req.query.status}, Amount: ${req.query.amount}`
  );
  try {
    // Update the payment entry based on player ID
    const paymentResult = await payment.findOneAndUpdate(
      { playerId: req.query.id, amount: req.query.amount }, // Find the payment by playerId
      { status: req.query.status }, // Update the status and amount
      { new: true } // Return the updated document
    );
    console.log(paymentResult);
    // Check if a payment record was found and updated
    if (!paymentResult) {
      return res.status(404).json({ message: "Payment not found" });
    }
    // Return success response with updated payment data
    return res.json({
      message: "Payment status updated successfully",
      updatedPayment: paymentResult,
    });
  } catch (err) {
    console.error(err); // Log the error to the console for debugging
    // Send an error response back to the client
    return res
      .status(500)
      .json({
        message: "An error occurred while processing the payment",
        error: err.message,
      });
  }
});

// update status on the basis of id and status
app.get("/updatestatusofwithdrawls", async (req, res) => {
  const { id, status, amount } = req.query;
  console.log(
    `Updating status for PlayerID: ${req.query.id}, Status: ${req.query.status}, Amount: ${req.query.amount}`
  );
  try {
    // Update the payment entry based on player ID
    const withdrawlResult = await withdrawl.findOneAndUpdate(
      { playerId: req.query.id, amount: req.query.amount }, // Find the withdrawl by playerId
      { status: req.query.status }, // Update the status and amount
      { new: true } // Return the updated document
    );
    console.log(withdrawlResult);
    // Check if a withdrawl record was found and updated
    if (!withdrawlResult) {
      return res.status(404).json({ message: "withdrawl not found" });
    }
    // Return success response with updated withdrawl data
    return res.json({
      message: "withdrawl status updated successfully",
      updatedwithdrawl: withdrawlResult,
    });
  } catch (err) {
    console.error(err); // Log the error to the console for debugging
    // Send an error response back to the client
    return res
      .status(500)
      .json({
        message: "An error occurred while processing the withdrawl",
        error: err.message,
      });
  }
});

// Confirm receive endpoint to send back receive data
app.get("/confirmreceive", async (req, res) => {
  try {
    // Fetch payment data from the database
    const withdrawlData = await withdrawl.find().sort({ createdAt: -1 }); // Adjust the query to fetch specific payment data if needed
    // console.log(paymentData);
    // Check if data exists
    if (!withdrawlData || withdrawlData.length === 0) {
      return res.status(404).json({ message: "No withdrawl data found" });
    }

    // Send back JSON data instead of plain text
    res.json(withdrawlData);
  } catch (err) {
    // console.error(err); // Log the error for debugging
    // Send an error response back to the client
    res
      .status(500)
      .json({
        message: "An error occurred while fetching withdrawl data",
        error: err.message,
      });
  }
});

// Confirm payment endpoint to send back payment data
app.get("/confirmpayment", async (req, res) => {
  try {
    // Fetch payment data from the database
    const paymentData = await payment.find().sort({ createdAt: -1 }); // Adjust the query to fetch specific payment data if needed
    // console.log(paymentData);
    // Check if data exists
    if (!paymentData || paymentData.length === 0) {
      return res.status(404).json({ message: "No payment data found" });
    }

    // Send back JSON data instead of plain text
    res.json(paymentData);
  } catch (err) {
    // console.error(err); // Log the error for debugging
    // Send an error response back to the client
    res
      .status(500)
      .json({
        message: "An error occurred while fetching payment data",
        error: err.message,
      });
  }
});

// Root route for generating and rendering QR code
app.get("/", async (req, res) => {
  try {
    const amount = req.query.amount || 0; // Default to 0 if not provided
    const qrCodeDataURL = await QRCode.toDataURL(
      `upi://pay?pa=1234567890@jat&pn=random&am=${amount}`
    );

    // Render the payment page with the generated QR code
    res.render("payment", {
      id: req.query.id || "N/A", // Provide a default value if not present
      amount: `${amount}`,
      qrdata: qrCodeDataURL,
    });
  } catch (err) {
    // console.error(err);
    res.status(500).send("Error generating QR code");
  }
});

// Admin checkin route
app.get("/api/v1/admincheckin", (req, res) => {
  // console.log(req.query.id);
  res.render("admincheckin");
});


// Admin checkout route
app.get("/api/v1/admincheckout", (req, res) => {
  // console.log(req.query.id);
  res.render("admincheckout");
});

// Connect to the database and start the server
connectDB()
  .then(() => {
    // Start the Express server only after a successful database connection
    app.listen(PORT, () => {
      console.log(`⚙️ Server is running at port: ${PORT}`);
    });
  })
  .catch((err) => {
    console.error("MongoDB connection failed!", err); // Use console.error for error messages
    process.exit(1); // Exit the process with failure
  });
