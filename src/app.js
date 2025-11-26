const express = require("express");
const cookieParser = require("cookie-parser");
const cors = require("cors");
const bodyParser = require("body-parser");
const morgan = require("morgan");
const fileUpload = require("express-fileupload");
const errorMiddleware = require("./middleware/error");
const apiRoutes = require("./routes/index");

const app = express();

// Middleware
app.use(cookieParser());
app.use(cors());
app.use(express.json({ limit: "1mb" }));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(
  fileUpload({
    limits: { fileSize: 50 * 1024 * 1024 },
    abortOnLimit: true,
    responseOnLimit: "File size limit exceeded",
    useTempFiles: false,
  })
);
app.use(express.urlencoded({ extended: false }));
app.use(morgan("dev"));

// Routes
app.get("/", (req, res) => {
  res.send(
    `<p style="text-align: center; font-size: 20px; color: green;">Welcome to ERP API!</p>`
  );
});

app.use("/api", apiRoutes);

// Error handlers
app.use(errorMiddleware);

module.exports = app;
