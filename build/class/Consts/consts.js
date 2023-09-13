"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TYPE = exports.STATUS = void 0;
class STATUS {
    static toJSON() {
        return {
            error: this.ERROR,
            wait: this.WAIT,
            ok: this.OK,
        };
    }
}
exports.STATUS = STATUS;
STATUS.ERROR = 403;
STATUS.WAIT = 199;
STATUS.OK = 200;
class TYPE {
    static toJSON() {
        return {
            error: this.ERROR,
            warning: this.WARNING,
            info: this.INFO,
            ok: this.OK,
            action: this.ACTION
        };
    }
}
exports.TYPE = TYPE;
TYPE.ERROR = 403;
TYPE.WARNING = 199;
TYPE.OK = 200;
TYPE.INFO = 201;
TYPE.ACTION = 202;
