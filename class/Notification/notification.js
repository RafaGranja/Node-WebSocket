"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Note = exports.NotificationSession = void 0;
const consts_1 = require("./consts");
class Note {
    constructor(type = "info", message = "Mensagem vazia", title = "Nova mensagem") {
        this.type = type;
        this.message = message;
        this.title = title;
    }
}
exports.Note = Note;
class NotificationSession {
    send() {
        this.destiny.ws.send({ status: consts_1.STATUS.OK, message: { type: this.note.type, title: this.note.title, message: this.note.message, sender: this.sender.login } });
    }
    constructor(sender, destiny, note = new Note()) {
        this.sender = sender;
        this.destiny = destiny;
        this.note = note;
    }
}
exports.NotificationSession = NotificationSession;
