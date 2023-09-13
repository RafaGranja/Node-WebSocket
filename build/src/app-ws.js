"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const WebServer = require('ws');
const app_se_1 = require("./app-se");
const log_1 = require("./log");
const clients_1 = require("../class/Client/clients");
const consts_1 = require("../class/Consts/consts");
const notification_1 = require("../class/Notification/notification");
const notificationService_1 = require("../class/Notification/notificationService");
const utils_1 = require("../class/Utils/utils");
//METODO QUE É CHAMADO QUANDO UMA CONEXÃO É ENCERRADA
function onClose(ws) {
    clients_1.Clients_Alone.getInstance().removeClient(ws);
    log_1.logger.info(`onClose: ${ws}`);
}
//MÉTODO CHAMADO AO OCORRER UM ERRO DE PROCESSAMENTO
function onError(ws, err) {
    log_1.logger.error(`onError:${ws}, message:${err.message}`);
    const note = new notification_1.NotificationSession(new clients_1.Client(ws), new notification_1.Note(consts_1.STATUS.ERROR, consts_1.TYPE.ERROR, err.message, "Erro"));
    notificationService_1.NotificationService.getInstance().addNotification(note);
}
//MÉTODO UTILIZADO PARA RECEBER MENSAGENS DO CLIENT
function onMessage(ws, data) {
    log_1.logger.info(`onMessage: ${data}`);
    const note = new notification_1.NotificationSession(new clients_1.Client(ws), new notification_1.Note(consts_1.STATUS.WAIT, consts_1.TYPE.INFO, JSON.stringify({ action: -1, content: "Processando..." }), "Aguarde"));
    notificationService_1.NotificationService.getInstance().addNotification(note);
    try {
        let jsonObject = JSON.parse(data);
        if (!(0, utils_1.validaValor)(jsonObject.name)) {
            throw Error("name informado não é válido");
        }
        else if (!(0, utils_1.validaValor)(jsonObject.login)) {
            throw Error("login informado não é válido");
        }
        else if (!(0, utils_1.validaValor)(jsonObject.action)) {
            throw Error("action informado não é válido");
        }
        else {
            switch (Number(jsonObject.action)) {
                case 1:
                    returnStatusConst(ws);
                    break;
                case 2:
                    (0, app_se_1.initSession)(jsonObject.key, ws, jsonObject.login, jsonObject.name);
                    break;
                case 3:
                    (0, app_se_1.NotifySession)(jsonObject.key, ws, jsonObject.type, jsonObject.title, jsonObject.message, Number(jsonObject.status));
                    break;
                default:
                    throw Error("action informado não é válido");
            }
        }
    }
    catch (e) {
        const note = new notification_1.NotificationSession(new clients_1.Client(ws), new notification_1.Note(consts_1.STATUS.ERROR, consts_1.TYPE.ERROR, e === null || e === void 0 ? void 0 : e.message, "Erro"));
        notificationService_1.NotificationService.getInstance().addNotification(note);
    }
}
function returnStatusConst(ws) {
    const note = new notification_1.NotificationSession(new clients_1.Client(ws), new notification_1.Note(consts_1.STATUS.OK, consts_1.TYPE.INFO, JSON.stringify({ content: { status: consts_1.STATUS.toJSON(), type: consts_1.TYPE.toJSON() }, action: 1 }), "CONSTS"));
    notificationService_1.NotificationService.getInstance().addNotification(note);
}
//MÉTODO UTILIZADO AO INICIAR CONEXÕES CLIENT-SERVER
function onConnection(ws, req) {
    ws.on('message', (data) => onMessage(ws, data));
    ws.on('error', (error) => onError(ws, error));
    ws.on('close', (ws) => onClose(ws));
    clients_1.Clients_Alone.getInstance().addClient(ws);
    log_1.logger.info(`onConnection`);
}
module.exports = (server) => {
    const wss = new WebServer.Server({
        server
    });
    //
    wss.on('connection', onConnection);
    log_1.logger.info(`App Web Socket Server is running!`);
    return wss;
};
