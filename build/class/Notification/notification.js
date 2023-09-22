"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Note = exports.NotificationError = exports.NotificationSession = void 0;
const clients_1 = require("../Client/clients");
const consts_1 = require("../Consts/consts");
class Note {
    constructor(status = consts_1.STATUS.OK, type = consts_1.TYPE.INFO, message = "Mensagem vazia", title = "Nova mensagem") {
        this.type = type;
        this.message = message;
        this.title = title;
        this.status = status;
    }
    toJSON() {
        return { type: this.type, message: this.message, title: this.title };
    }
}
exports.Note = Note;
class NotificationSession {
    send() {
        this.destiny.ws.send(JSON.stringify({
            status: this.status,
            body: this.note.toJSON(),
            sender: this.sender,
        }));
    }
    constructor(destiny, note = new Note(), sender = clients_1.DefaultClient) {
        this.sender = sender;
        this.destiny = destiny;
        this.note = note;
        this.status = note.status;
    }
}
exports.NotificationSession = NotificationSession;
class NotificationError extends NotificationSession {
    constructor(destiny, note, sender = clients_1.DefaultClient) {
        super(destiny, new Note(consts_1.STATUS.ERROR, consts_1.TYPE.ERROR, JSON.stringify({ content: note, action: "error" }), "Error"), sender);
    }
}
exports.NotificationError = NotificationError;
