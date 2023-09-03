"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.initSession = void 0;
const session_1 = require("../class/session");
const clients_1 = require("../class/clients");
const controlSessions_1 = require("../class/controlSessions");
function initSession(key, ws, login, name) {
    if (key == undefined || key == null || key == "") {
        throw Error("key informada não é válida");
    }
    else {
        const cli = new clients_1.Client(ws, login, name, key);
        if (controlSessions_1.DelpSessions.getInstance().hasSession(key)) {
            controlSessions_1.DelpSessions.getInstance().addClient(cli);
        }
        else {
            const new_session = new session_1.DelpSession(key, cli);
            controlSessions_1.DelpSessions.getInstance().addSession(new_session, key);
            controlSessions_1.DelpSessions.getInstance().addClient(cli);
        }
        clients_1.Clients.clients.delete(ws);
    }
    return true;
}
exports.initSession = initSession;
function NotifySession(key, type, title, message) {
}
