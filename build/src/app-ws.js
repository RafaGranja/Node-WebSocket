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
function onClose(cli) {
    clients_1.Clients.getInstance().removeClient(cli);
    log_1.logger.info(`onClose: ${cli}`);
}
exports.onClose = onClose;
function onError(cli, err) {
    log_1.logger.error(`onError:${cli}, message:${err.message}`);
    const note = new notification_1.NotificationError(cli, err.message);
    notificationService_1.NotificationService.getInstance().addNotification(note);
}
exports.onError = onError;
function onMessage(cli, data) {
    log_1.logger.info(`onMessage: ${data}`);
    const note = new notification_1.NotificationSession(cli, new notification_1.Note(consts_1.STATUS.WAIT, consts_1.TYPE.INFO, JSON.stringify({ action: "await", content: `Processando...` }), "Aguarde"));
    notificationService_1.NotificationService.getInstance().addNotification(note);
    try {
        let jsonObject = JSON.parse(data);
        let cli_aux = clients_1.Clients.getInstance().getClient(cli.ws);
        cli = cli_aux == undefined ? cli : cli_aux;
        if (!(0, utils_1.validaValor)(jsonObject.action)) {
            throw Error("action informado não é válido");
        }
        else {
            switch (jsonObject.action) {
                case "returnConst":
                    returnConst(cli.ws);
                    break;
                case "autenticate":
                    if (!(0, utils_1.validaValor)(jsonObject.name)) {
                        throw Error("name informado não é válido");
                    }
                    else if (!(0, utils_1.validaValor)(jsonObject.login)) {
                        throw Error("login informado não é válido");
                    }
                    else {
                        (0, app_se_1.autenticate)(cli.ws, jsonObject.login, jsonObject.name);
                    }
                    break;
                case "initSession":
                    log_1.logger.info(cli, jsonObject);
                    if (cli == undefined || cli == null || cli.login == clients_1.DefaultClient.login) {
                        throw Error("Necessária autenticação prévia");
                    }
                    else if (!(0, utils_1.validaValor)(cli.name)) {
                        throw Error("name informado não é válido");
                    }
                    else if (!(0, utils_1.validaValor)(cli.login)) {
                        throw Error("login informado não é válido");
                    }
                    else {
                        (0, app_se_1.initSession)(jsonObject.key, cli);
                    }
                    break;
                case 'returnSessions':
                    returnSessions(cli);
                    break;
                case 'returnClients':
                    returnClients(cli);
                    break;
                default:
                    throw Error("action informado não é válido");
            }
        }
    }
    catch (e) {
        const note = new notification_1.NotificationError(cli, e === null || e === void 0 ? void 0 : e.message);
        notificationService_1.NotificationService.getInstance().addNotification(note);
    }
}
exports.onMessage = onMessage;
function returnConst(ws) {
    const note = new notification_1.NotificationSession(new clients_1.Client(ws), new notification_1.Note(consts_1.STATUS.OK, consts_1.TYPE.INFO, JSON.stringify({ content: (0, consts_1.Consts)(), action: "returnConst" }), "CONSTS"));
    notificationService_1.NotificationService.getInstance().addNotification(note);
}
function onConnection(ws, req) {
    let cli = new clients_1.Client(ws);
    ws.on("message", (data) => onMessage(cli, data));
    ws.on("error", (error) => onError(cli, error));
    ws.on("close", (ws) => onClose(cli));
    clients_1.Clients.getInstance().addClient(ws, cli);
    log_1.logger.info(`onConnection`);
}
function returnSessions(cli) {
    const note = new notification_1.NotificationSession(cli, new notification_1.Note(consts_1.STATUS.OK, consts_1.TYPE.OK, JSON.stringify({ action: "returnSessions", content: controlSessions_1.DelpSessions.getInstance().toJSON() }), "Sucesso"));
    notificationService_1.NotificationService.getInstance().addNotification(note);
}
function returnClients(cli) {
    const note = new notification_1.NotificationSession(cli, new notification_1.Note(consts_1.STATUS.OK, consts_1.TYPE.OK, JSON.stringify({ action: "returnClients", content: clients_1.Clients.getInstance().toJSON() }), "Sucesso"));
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
