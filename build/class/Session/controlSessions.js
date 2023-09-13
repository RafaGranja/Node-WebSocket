"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DelpSessions = void 0;
const clients_1 = require("../Client/clients");
const consts_1 = require("../Consts/consts");
const notification_1 = require("../Notification/notification");
const notificationService_1 = require("../Notification/notificationService");
const log_1 = require("../../src/log");
class DelpSessions {
    constructor() {
        this.sessions = new Map();
    }
    //RETORNA INSTANCÂNCIA DO SINGLETON
    static getInstance() {
        if (!DelpSessions.instance) {
            DelpSessions.instance = new DelpSessions();
        }
        return DelpSessions.instance;
    }
    //METODO QUE É CHAMADO QUANDO UMA CONEXÃO É ENCERRADA
    onClose(cli, ws) {
        var _a;
        (_a = this.sessions.get(cli.key)) === null || _a === void 0 ? void 0 : _a.clients.delete(cli);
        log_1.logger.info(`onClose: ${cli.ws}`);
    }
    //MÉTODO QUE É CHAMADO AO OCORRER UM ERRO NO WS-CLIENT
    onError(cli, err) {
        log_1.logger.error(`onError:${cli.ws}, message:${err.message}`);
        const note = new notification_1.NotificationSession(cli, new notification_1.Note(consts_1.STATUS.ERROR, consts_1.TYPE.ERROR, err, `Erro do cliente ${cli.login} `));
        notificationService_1.NotificationService.getInstance().addNotification(note);
    }
    //MÉTODO QUE É CHAMADO AO CLIENT ENVIAR UMA MENSAGEM PARA A SESSÃO
    onMessage(cli, data) {
        log_1.logger.info(`onMessage: ${data}`);
        const note = new notification_1.NotificationSession(cli, new notification_1.Note(consts_1.STATUS.WAIT, consts_1.TYPE.INFO, "Processando...", "Aguarde"));
        notificationService_1.NotificationService.getInstance().addNotification(note);
        let jsonObject = JSON.parse(data);
        if (jsonObject.type == consts_1.TYPE.ACTION) {
            this.processAction(jsonObject, cli);
        }
    }
    //MÉTODO UTILIZADO PARA ADICIONAR UM CLIENT À SESSÃO CORRETA
    addClient(cli) {
        var _a;
        cli.ws.on('message', (data) => this.onMessage(cli, data));
        cli.ws.on('error', (error) => this.onError(cli, error));
        cli.ws.on('close', (ws) => this.onClose(cli, ws));
        (_a = this.sessions.get(cli.key)) === null || _a === void 0 ? void 0 : _a.clients.add(cli);
        const note = new notification_1.NotificationSession(cli, new notification_1.Note(consts_1.STATUS.OK, consts_1.TYPE.INFO, JSON.stringify({ content: `Conexão estabelecida com a sessão ${cli.key}`, action: 2 }), "Sucesso"));
        notificationService_1.NotificationService.getInstance().addNotification(note);
    }
    addSession(new_session, key) {
        this.sessions.set(key, new_session);
    }
    getSession(key) {
        return this.sessions.get(key);
    }
    hasSession(key) {
        return this.sessions.has(key);
    }
    deleteClient(cli, key) {
    }
    notifySession(key, note, sender = clients_1.DefaultClient) {
        var _a;
        (_a = this.getSession(key)) === null || _a === void 0 ? void 0 : _a.notifyAll(sender, note);
    }
    processAction(data, cli) {
    }
}
exports.DelpSessions = DelpSessions;
