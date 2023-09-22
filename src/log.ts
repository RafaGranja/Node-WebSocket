const winston = require("winston");
require("winston-daily-rotate-file");

const options = {
  filename: "logs/server-%DATE%.log",

  datePattern: "YYYY-MM-DD", // Rotate every day

  zippedArchive: true,

  maxSize: "20m",

  maxFiles: "31d",

};

const options2 = {
  filename: "logs/error-%DATE%.log",

  datePattern: "YYYY-MM-DD", // Rotate every day

  zippedArchive: true,

  maxSize: "20m",

  maxFiles: "31d",

  level: "error"
};

const logger = winston.createLogger({
  level: "info",
  format: winston.format.combine(
    winston.format.colorize({ all: true }),
    winston.format.timestamp({ format: "YYYY/MM/DD HH:mm:ss" }),
    winston.format.printf(
      (info: any) => `[${info.timestamp}] ${info.level}: ${info.message}`
    )
  ),
  defaultMeta: { service: "user-service" },
  transports: [
    new winston.transports.File({ filename: "logs/error.log", level: "error" }),
    new winston.transports.File({ filename: "logs/server.log" }),
    new winston.transports.DailyRotateFile(options),
    new winston.transports.DailyRotateFile(options2),
  ],
});

export { logger };
