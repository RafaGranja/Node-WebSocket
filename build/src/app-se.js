"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.NotifySession = exports.initSession = void 0;
const session_1 = require("../class/Session/session");
const clients_1 = require("../class/Client/clients");
const controlSessions_1 = require("../class/Session/controlSessions");
const notification_1 = require("../class/Notification/notification");
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
        clients_1.Clients_Alone.getInstance().removeClient(ws);
    }
    return true;
}
exports.initSession = initSession;
function NotifySession(key, sender = clients_1.DefaultClient, type, title, message, status) {
    var _a;
    (_a = controlSessions_1.DelpSessions.getInstance().getSession(key)) === null || _a === void 0 ? void 0 : _a.notifyAll(clients_1.DefaultClient, new notification_1.Note(status, type, JSON.stringify({ content: message, action: 3 }), title));
}
exports.NotifySession = NotifySession;
