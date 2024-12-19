"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.onError = exports.onClose = exports.onMessage = void 0;
const WebServer = require("ws");
const app_se_1 = require("./app-se");
const log_1 = require("./log");
const clients_1 = require("../class/Client/clients");
const consts_1 = require("../class/Consts/consts");
const notification_1 = require("../class/Notification/notification");
const notificationService_1 = require("../class/Notification/notificationService");
const utils_1 = require("../class/Utils/utils");
const controlSessions_1 = require("../class/Session/controlSessions");
const customError_1 = require("../class/Error/customError");
function onClose(cli) {
    var _a;
    log_1.logger.info(`onClose app-ws: ${JSON.stringify(cli.toJSON())}`);
    cli.removeAllListeners();
    clients_1.Clients.getInstance().removeClientLogin(cli.login, cli.key);
    if (cli.key != '') {
        (_a = controlSessions_1.DelpSessions.getInstance().getSession(cli.key)) === null || _a === void 0 ? void 0 : _a.deleteClientMap(cli);
    }
    log_1.logger.info(`onClose app-ws: ${JSON.stringify(cli.toJSON())}`);
}
exports.onClose = onClose;
function onError(cli, err) {
    log_1.logger.error(`onError app-ws:${cli}, message:${err.message}`);
    const note = new notification_1.NotificationError(cli, err.message, 0);
    notificationService_1.NotificationService.getInstance().addNotification(note);
}
exports.onError = onError;
function onMessage(cli, data) {
    log_1.logger.info(`onMessage: ${data}`);
    const note = new notification_1.NotificationSession(cli, new notification_1.Note(consts_1.STATUS.WAIT, consts_1.TYPE.INFO, { "action": "await", "content": `Processando...` }, "Aguarde"));
    notificationService_1.NotificationService.getInstance().addNotification(note);
    try {
        let jsonObject = JSON.parse(data);
        let cli_aux = clients_1.Clients.getInstance().getClient(cli.ws);
        cli = cli_aux == undefined ? cli : cli_aux;
        if (!(0, utils_1.validaValor)(jsonObject.action)) {
            throw new customError_1.CustomError("action informado não é válido", 1);
        }
        else {
            switch (jsonObject.action) {
                case "returnConst":
                    returnConst(cli.ws);
                    break;
                case "autenticate":
                    if (!(0, utils_1.validaValor)(jsonObject.name)) {
                        throw new customError_1.CustomError("name informado não é válido", 1);
                    }
                    else if (!(0, utils_1.validaValor)(jsonObject.login)) {
                        throw new customError_1.CustomError("login informado não é válido", 1);
                    }
                    else {
                        (0, app_se_1.autenticate)(cli, jsonObject.login, jsonObject.name, jsonObject.spectate.toString());
                    }
                    break;
                case "initSession":
                    log_1.logger.info(cli, jsonObject);
                    if (cli == undefined ||
                        cli == null ||
                        cli.login == clients_1.DefaultClient.login) {
                        throw new customError_1.CustomError("Necessária autenticação prévia", 1);
                    }
                    else if (!(0, utils_1.validaValor)(cli.name)) {
                        throw new customError_1.CustomError("name informado não é válido", 1);
                    }
                    else if (!(0, utils_1.validaValor)(cli.login)) {
                        throw new customError_1.CustomError("login informado não é válido", 1);
                    }
                    else {
                        (0, app_se_1.initSession)(jsonObject.key, cli);
                    }
                    break;
                case "returnSessions":
                    returnSessions(cli);
                    break;
                case "returnClients":
                    returnClients(cli);
                    break;
                default:
                    throw new customError_1.CustomError("action informado não é válido", 1);
            }
        }
    }
    catch (e) {
        const note = new notification_1.NotificationError(cli, e === null || e === void 0 ? void 0 : e.message, e === null || e === void 0 ? void 0 : e.critical);
        notificationService_1.NotificationService.getInstance().addNotification(note);
    }
}
exports.onMessage = onMessage;
function returnConst(ws) {
    const note = new notification_1.NotificationSession(new clients_1.Client(ws), new notification_1.Note(consts_1.STATUS.OK, consts_1.TYPE.INFO, { "content": (0, consts_1.Consts)(), "action": "returnConst" }, "CONSTS"));
    notificationService_1.NotificationService.getInstance().addNotification(note);
}
function onConnection(ws, req) {
    let cli = new clients_1.Client(ws);
    cli.ws.on("message", (data) => onMessage(cli, data));
    cli.ws.on("error", (error) => onError(cli, error));
    cli.ws.on("close", (ws) => onClose(cli));
    clients_1.Clients.getInstance().addClient(cli.ws, cli);
    log_1.logger.info(`onConnection app-ws`);
}
function returnSessions(cli) {
    const note = new notification_1.NotificationSession(cli, new notification_1.Note(consts_1.STATUS.OK, consts_1.TYPE.OK, {
        "action": "returnSessions",
        "content": controlSessions_1.DelpSessions.getInstance().toArray(),
    }, "Sucesso"));
    notificationService_1.NotificationService.getInstance().addNotification(note);
}
function returnClients(cli) {
    const note = new notification_1.NotificationSession(cli, new notification_1.Note(consts_1.STATUS.OK, consts_1.TYPE.OK, {
        "action": "returnClients",
        "content": clients_1.Clients.getInstance().toArray(),
    }, "Sucesso"));
    notificationService_1.NotificationService.getInstance().addNotification(note);
}
module.exports = (server) => {
    const wss = new WebServer.Server({
        server,
    });
    wss.on("connection", onConnection);
    log_1.logger.info(`App Web Socket Server is running!`);
    return wss;
};
