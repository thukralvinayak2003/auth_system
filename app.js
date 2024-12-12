const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const mongoSanitize = require("express-mongo-sanitize");
const xss = require("xss-clean");
const rateLimit = require("express-rate-limit");
const helmet = require("helmet");
const hpp = require("hpp");
const cookieParser = require("cookie-parser");
const compression = require("compression");
const authRouter = require("./routes/authRouter");

const app = express();

app.use(express.json());

dotenv.config({ path: "./config.env" });

app.use(cors());
app.use(helmet());

const limiter = rateLimit({
  max: 10000,
  windowMS: 6 * 60 * 1000,
  message: "Too many requests from this IP . Please try again later",
});

app.use("/api", limiter);

app.use(mongoSanitize());

app.use(xss());

app.use(cookieParser());

app.use(
  hpp({
    whitelist: [],
  })
);

app.use(compression());

app.use("/api/auth", authRouter);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

module.exports = app;
