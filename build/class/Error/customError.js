"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CustomError = void 0;
class CustomError extends Error {
    constructor(message, critical = 0) {
        super(message);
        this.critical = critical;
    }
}
exports.CustomError = CustomError;
