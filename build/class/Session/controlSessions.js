"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DelpSessions = void 0;
const clients_1 = require("../Client/clients");
const consts_1 = require("../Consts/consts");
const notification_1 = require("../Notification/notification");
const notificationService_1 = require("../Notification/notificationService");
const log_1 = require("../../src/log");
const utils_1 = require("../Utils/utils");
class DelpSessions {
    constructor() {
        this.sessions = new Map();
    }
    static getInstance() {
        if (!DelpSessions.instance) {
            DelpSessions.instance = new DelpSessions();
        }
        return DelpSessions.instance;
    }
    onClose(cli) {
        var _a;
        (_a = this.sessions.get(cli.key)) === null || _a === void 0 ? void 0 : _a.deleteClientMap(cli);
        clients_1.Clients.getInstance().removeClient(cli.ws);
        log_1.logger.info(`onClose: ${cli}`);
    }
    onError(cli, err) {
        log_1.logger.error(`onError:${cli.ws}, message:${err.message}`);
        const note = new notification_1.NotificationError(cli, err);
        notificationService_1.NotificationService.getInstance().addNotification(note);
    }
    onMessage(cli, data) {
        let jsonObject = JSON.parse(data);
        this.processAction(jsonObject, cli);
    }
    addClient(cli) {
        var _a;
        cli.ws.on("message", (data) => this.onMessage(cli, data));
        cli.ws.on("error", (error) => this.onError(cli, error));
        cli.ws.on("close", () => this.onClose(cli));
        (_a = this.sessions.get(cli.key)) === null || _a === void 0 ? void 0 : _a.addClient(cli);
        clients_1.Clients.getInstance().addClient(cli.ws, cli);
        const note = new notification_1.NotificationSession(cli, new notification_1.Note(consts_1.STATUS.OK, consts_1.TYPE.INFO, JSON.stringify({
            content: `Conexão estabelecida com a sessão ${cli.key}`,
            action: "initSession",
        }), "Sucesso"));
        notificationService_1.NotificationService.getInstance().addNotification(note);
    }
    toJSON() {
        let ret;
        let i = 0;
        this.sessions.forEach((item) => {
            ret[i] = item.toJSON();
            i++;
        });
        return JSON.stringify(ret);
    }
    addSession(new_session, key) {
        this.sessions.set(key, new_session);
    }
    getSession(key) {
        return this.sessions.get(key);
    }
    getSessions() {
        return this.sessions;
    }
    hasSession(key) {
        return this.sessions.has(key);
    }
    getClientByLogin(key, login) {
        var _a;
        return (_a = this.getSession(key)) === null || _a === void 0 ? void 0 : _a.getClientByLogin(login);
    }
    notifySession(key, note, sender = clients_1.DefaultClient) {
        var _a;
        (_a = this.getSession(key)) === null || _a === void 0 ? void 0 : _a.notifyAll(sender, note);
    }
    processAction(jsonObject, cli) {
        const note = new notification_1.NotificationSession(cli, new notification_1.Note(consts_1.STATUS.WAIT, consts_1.TYPE.INFO, JSON.stringify({ action: "await", content: "Processando..." }), "Aguarde"));
        notificationService_1.NotificationService.getInstance().addNotification(note);
        try {
            if (!(0, utils_1.validaValor)(jsonObject.action)) {
                throw Error("action informado não é válido");
            }
            else {
                switch (jsonObject.action) {
                    case "notifySession":
                    case "execScript":
                        this.notifySession(cli.key, new notification_1.Note(jsonObject.status, jsonObject.type, JSON.stringify({
                            content: jsonObject.message,
                            action: jsonObject.action,
                        }), jsonObject.title), cli);
                        break;
                    case "statusSession":
                        if (!(0, utils_1.validaValor)(jsonObject.state)) {
                            throw new Error("Necessário informar um estado para sessão");
                        }
                        else {
                            this.statusSession(jsonObject.state, cli);
                        }
                        break;
                    case "closeSession":
                        this.closeSession(cli);
                        break;
                    case "deleteClient":
                        this.deleteClient(cli, jsonObject.targetLogin);
                        break;
                    case "lockSession":
                        this.lockSession(cli);
                        break;
                    case 'returnSessions':
                        this.returnSessions(cli);
                        break;
                    case 'returnClients':
                        this.returnClients(cli);
                        break;
                    default:
                        throw Error("action informado - " + jsonObject.action + " - não é válido");
                }
            }
        }
        catch (e) {
            const note = new notification_1.NotificationError(cli, e === null || e === void 0 ? void 0 : e.message);
            notificationService_1.NotificationService.getInstance().addNotification(note);
        }
    }
    statusSession(state, sender) {
        var _a;
        let session = this.getSession(sender.key);
        if (session == undefined) {
            throw new Error("Sessão informada é inválida");
        }
        else if (session.getCreator() != sender) {
            throw new Error("Usuário não possui acesso a esta funcionalidade");
        }
        else {
            (_a = this.getSession(sender.key)) === null || _a === void 0 ? void 0 : _a.setState(state);
        }
    }
    deleteClient(sender, cli) {
        var _a, _b;
        let cli_obj = this.getClientByLogin(sender.key, cli);
        if (cli_obj != undefined && cli_obj != null) {
            if (sender != ((_a = this.getSession(sender.key)) === null || _a === void 0 ? void 0 : _a.getCreator())) {
                (_b = this.getSession(sender.key)) === null || _b === void 0 ? void 0 : _b.deleteClient(cli_obj);
            }
            else {
                throw new Error("Usuário não possui permissão para a ação");
            }
        }
        else {
            throw new Error("Usuário selecionado não encontrado na sessão");
        }
    }
    lockSession(sender) {
        var _a;
        let session = this.getSession(sender.key);
        if (session == undefined) {
            throw new Error("Sessão informada é inválida");
        }
        else if (session.getCreator() != sender) {
            throw new Error("Usuário não possui acesso a esta funcionalidade");
        }
        else {
            (_a = this.getSession(sender.key)) === null || _a === void 0 ? void 0 : _a.deleteClients(sender);
            this.closeSession(sender);
        }
    }
    closeSession(sender) {
        var _a;
        (_a = this.getSession(sender.key)) === null || _a === void 0 ? void 0 : _a.deleteClients();
    }
    returnSessions(cli) {
        var _a;
        const note = new notification_1.NotificationSession(cli, new notification_1.Note(consts_1.STATUS.OK, consts_1.TYPE.OK, JSON.stringify({ action: "returnSessions", content: (_a = DelpSessions.getInstance().getSession(cli.key)) === null || _a === void 0 ? void 0 : _a.toJSON() }), "Sucesso"));
        notificationService_1.NotificationService.getInstance().addNotification(note);
    }
    returnClients(cli) {
        var _a;
        const note = new notification_1.NotificationSession(cli, new notification_1.Note(consts_1.STATUS.OK, consts_1.TYPE.OK, JSON.stringify({ action: "returnClients", content: (_a = DelpSessions.getInstance().getSession(cli.key)) === null || _a === void 0 ? void 0 : _a.getClients().toJSON() }), "Sucesso"));
        notificationService_1.NotificationService.getInstance().addNotification(note);
    }
}
exports.DelpSessions = DelpSessions;
