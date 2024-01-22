import express from "express";
import bodyParser from "body-parser";
import cookieParser from "cookie-parser";
import cors from "cors";
import senderRoute from "./routes/sender.route.js";

const app = express();

app.use(bodyParser.json({ limit: '50mb' }));
app.use(bodyParser.urlencoded({ limit: '50mb', extended: true }));
app.use(cors({ origin: ["http://localhost:3000", "https://test-node-sender.onrender.com", "https://test-node-sender.onrender.com/amazon", "https://premium-nodemailer.onrender.com", "https://node-sender-bb4y0.onrender.com", "https://node-sender-bb4y0.onrender.com/amazon", "https://node-sender-stillbroke.onrender.com", "https://node-sender-stillbroke.onrender.com/amazon", "https://malaika-mailer.onrender.com", "https://malaika-mailer.onrender.com/amazon"], credentials: true }));
app.use(express.json());
app.use(cookieParser());

// Use your existing routes
app.use("/twilio", senderRoute);

// Error handling middleware
app.use((error, req, res, next) => {
  const errorStatus = error.status || 500;
  const errorMessage = error.message || "Something went wrong!";
  return res.status(errorStatus).send(errorMessage);
});

// Default route
app.use("/", (req, res) => {
  res.send("Welcome to Twilio SMS Sender!");
});

const port = process.env.PORT || 8800;
app.listen(port, () => {
  console.log(`Twilio SMS Sender is running on port ${port}`);
});
