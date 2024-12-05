"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.autenticate = exports.NotifySession = exports.initSession = void 0;
const session_1 = require("../class/Session/session");
const clients_1 = require("../class/Client/clients");
const controlSessions_1 = require("../class/Session/controlSessions");
const notification_1 = require("../class/Notification/notification");
const consts_1 = require("../class/Consts/consts");
const notificationService_1 = require("../class/Notification/notificationService");
const app_ws_1 = require("./app-ws");
const customError_1 = require("../class/Error/customError");
function initSession(key, cli) {
    var _a, _b;
    if (key == undefined || key == null || key == "") {
        throw Error("key informada não é válida");
    }
    if (cli == undefined || cli == null) {
        throw Error("Client informado não é válido");
    }
    else {
        cli.removeAllListeners();
        cli = new clients_1.Client(cli.ws, cli.login, cli.name, key, cli.spectate.toString());
        if (controlSessions_1.DelpSessions.getInstance().hasSession(key)) {
            if (((_a = controlSessions_1.DelpSessions.getInstance().getSession(key)) === null || _a === void 0 ? void 0 : _a.getState()) == consts_1.SESSION.CLOSED && !cli.spectate) {
                throw new customError_1.CustomError("Sessão está fechada para entrada de novos usuários, Administrador Responsável : " +
                    ((_b = controlSessions_1.DelpSessions.getInstance().getSession(key)) === null || _b === void 0 ? void 0 : _b.getCreator().name), 1);
            }
            else {
                controlSessions_1.DelpSessions.getInstance().addClient(cli);
            }
        }
        else {
            const new_session = new session_1.DelpSession(key, cli);
            controlSessions_1.DelpSessions.getInstance().addSession(new_session, key);
            controlSessions_1.DelpSessions.getInstance().addClient(cli);
        }
    }
    return true;
}
exports.initSession = initSession;
function NotifySession(key, sender = clients_1.DefaultClient, action, type, title, message, status) {
    var _a;
    (_a = controlSessions_1.DelpSessions.getInstance()
        .getSession(key)) === null || _a === void 0 ? void 0 : _a.notifyAll(sender, new notification_1.Note(status, type, { "content": message, "action": action }, title));
}
exports.NotifySession = NotifySession;
function autenticate(cli, login, name, spectate) {
    cli.removeAllListeners();
    cli.ws.on("message", (data) => (0, app_ws_1.onMessage)(cli, data));
    cli.ws.on("error", (error) => (0, app_ws_1.onError)(cli, error));
    cli.ws.on("close", (ws) => (0, app_ws_1.onClose)(cli));
    let _cli = new clients_1.Client(cli.ws, login, name, '', spectate);
    clients_1.Clients.getInstance().addClient(cli.ws, _cli);
    const note = new notification_1.NotificationSession(cli, new notification_1.Note(consts_1.STATUS.OK, consts_1.TYPE.INFO, {
        "content": "Autenticado com sucesso",
        "action": "autenticate",
    }, "Sucesso"));
    notificationService_1.NotificationService.getInstance().addNotification(note);
}
exports.autenticate = autenticate;
