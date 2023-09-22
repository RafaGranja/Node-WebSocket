//app.js
const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");

const _app = express();

_app.use(cors({ origin: process.env.CORS_ORIGIN || "*" }));

_app.use(helmet());

_app.use(express.json());

_app.use(morgan("dev"));

_app.post("/connect", (req: any, res: any, next: any) => {
  res.json({ token: "123456" });
});

module.exports = _app;
