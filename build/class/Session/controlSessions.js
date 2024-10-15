"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DelpSessions = void 0;
const clients_1 = require("../Client/clients");
const consts_1 = require("../Consts/consts");
const notification_1 = require("../Notification/notification");
const notificationService_1 = require("../Notification/notificationService");
const log_1 = require("../../src/log");
const utils_1 = require("../Utils/utils");
const customError_1 = require("../Error/customError");
const app_se_1 = require("../../src/app-se");
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
        clients_1.Clients.getInstance().removeClient(cli);
        log_1.logger.info(`onClose: ${cli}`);
        log_1.logger.error(`onClose: ${cli}`);
    }
    onError(cli, err) {
        var _a;
        log_1.logger.error(`onError:${cli.ws}, message:${err.message}`);
        const note = new notification_1.NotificationError(cli, err, 0);
        notificationService_1.NotificationService.getInstance().addNotification(note);
        log_1.logger.info(`onError:${cli.ws}, message:${err.message}`);
        if (!((_a = DelpSessions.getInstance().getSession(cli.key)) === null || _a === void 0 ? void 0 : _a.getClients().getAllClients().size)) {
            DelpSessions.getInstance().removeSession(cli.key);
        }
    }
    onMessage(cli, data) {
        let jsonObject = JSON.parse(data);
        this.processAction(jsonObject, cli);
    }
    addClient(cli) {
        var _a, _b;
        cli.ws.on("message", (data) => this.onMessage(cli, data));
        cli.ws.on("error", (error) => this.onError(cli, error));
        cli.ws.on("close", () => this.onClose(cli));
        (_a = this.sessions.get(cli.key)) === null || _a === void 0 ? void 0 : _a.addClient(cli);
        clients_1.Clients.getInstance().removeClient(cli.ws);
        const note = new notification_1.NotificationSession(cli, new notification_1.Note(consts_1.STATUS.OK, consts_1.TYPE.INFO, {
            "content": `Conexão estabelecida com a sessão ${cli.key}`,
            "action": "initSession",
            "creator": (_b = this.sessions.get(cli.key)) === null || _b === void 0 ? void 0 : _b.getCreator().login
        }, "Sucesso"));
        notificationService_1.NotificationService.getInstance().addNotification(note);
    }
    toJSON() {
        let ret = new Array();
        this.sessions.forEach((item) => {
            ret.push(item.toJSON());
        });
        return ret;
    }
    addSession(new_session, key) {
        this.sessions.set(key, new_session);
    }
    getSession(key) {
        return this.sessions.get(key);
    }
    removeSession(key) {
        return this.sessions.delete(key);
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
        const note = new notification_1.NotificationSession(cli, new notification_1.Note(consts_1.STATUS.WAIT, consts_1.TYPE.INFO, { "action": "await", "content": "Processando..." }, "Aguarde"));
        notificationService_1.NotificationService.getInstance().addNotification(note);
        try {
            if (!(0, utils_1.validaValor)(jsonObject.action)) {
                throw new customError_1.CustomError("action informado não é válido", 1);
            }
            else {
                switch (jsonObject.action) {
                    case "notifySession":
                    case "execScript":
                        this.notifySession(cli.key, new notification_1.Note(jsonObject.status, jsonObject.type, {
                            "content": jsonObject.message,
                            "action": jsonObject.action,
                        }, jsonObject.title), cli);
                        break;
                    case "statusSession":
                        if (!(0, utils_1.validaValor)(jsonObject.state)) {
                            throw new customError_1.CustomError("Necessário informar um estado para sessão", 0);
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
                    case "returnSessions":
                        this.returnSessions(cli);
                        break;
                    case "returnClients":
                        this.returnClients(cli);
                        break;
                    case "disconnectSession":
                        this.disconnectSession(cli);
                        break;
                    case "openSession":
                        this.openSession(cli);
                        break;
                    case "setCreator":
                        this.setCreator(cli, jsonObject.login);
                        break;
                    default:
                        throw Error(JSON.stringify({
                            "message": "action informado - " + jsonObject.action + " - não é válido", "critical": 1
                        }));
                }
            }
        }
        catch (e) {
            log_1.logger.error(`onError:${cli.ws}, message:${e.message}`);
            const note = new notification_1.NotificationError(cli, e === null || e === void 0 ? void 0 : e.message, e === null || e === void 0 ? void 0 : e.critical);
            notificationService_1.NotificationService.getInstance().addNotification(note);
        }
    }
    setCreator(cli, login) {
        var _a, _b, _c;
        let creator = (_a = this.getSession(cli.key)) === null || _a === void 0 ? void 0 : _a.getClientByLogin(login);
        try {
            if (creator.spectate) {
                throw new customError_1.CustomError("Usuário selecionado não pode se tornar adiministrador", 0);
            }
            else if (creator != undefined && cli.login == ((_b = this.getSession(cli.key)) === null || _b === void 0 ? void 0 : _b.getCreator().login)) {
                (_c = this.getSession(cli.key)) === null || _c === void 0 ? void 0 : _c.setCreator(creator);
            }
            else {
                throw new customError_1.CustomError("Usuário não possui acesso a esta funcionalidade", 0);
            }
        }
        catch (e) {
            log_1.logger.error(`onError:${cli.ws}, message:${e.message}`);
            const note = new notification_1.NotificationError(cli, e === null || e === void 0 ? void 0 : e.message, e === null || e === void 0 ? void 0 : e.critical);
            notificationService_1.NotificationService.getInstance().addNotification(note);
        }
    }
    disconnectSession(cli) {
        var _a;
        (_a = this.getSession(cli.key)) === null || _a === void 0 ? void 0 : _a.deleteClientMap(cli);
        clients_1.Clients.getInstance().removeClient(cli);
        cli.key = '';
        (0, app_se_1.autenticate)(cli.ws, cli.login, cli.name, cli.spectate.toString());
    }
    statusSession(state, sender) {
        var _a;
        let session = this.getSession(sender.key);
        try {
            if (session == undefined) {
                throw new customError_1.CustomError("Sessão informada é inválida", 0);
            }
            else if (session.getCreator().login != sender.login) {
                throw new customError_1.CustomError("Usuário não possui acesso a esta funcionalidade", 0);
            }
            else {
                (_a = this.getSession(sender.key)) === null || _a === void 0 ? void 0 : _a.setState(state);
            }
        }
        catch (e) {
            log_1.logger.error(`onError:${sender.ws}, message:${e.message}`);
            const note = new notification_1.NotificationError(sender, e === null || e === void 0 ? void 0 : e.message, e === null || e === void 0 ? void 0 : e.critical);
            notificationService_1.NotificationService.getInstance().addNotification(note);
        }
    }
    deleteClient(sender, cli) {
        var _a, _b;
        let cli_obj = this.getClientByLogin(sender.key, cli);
        try {
            if (cli_obj != undefined && cli_obj != null) {
                if (sender.login == ((_a = this.getSession(sender.key)) === null || _a === void 0 ? void 0 : _a.getCreator().login)) {
                    if (sender.login != cli) {
                        (_b = this.getSession(sender.key)) === null || _b === void 0 ? void 0 : _b.deleteClient(cli_obj);
                    }
                    else {
                        throw new customError_1.CustomError("Usuário não pode se desconectar");
                    }
                }
                else {
                    throw new customError_1.CustomError("Usuário não possui permissão para a ação");
                }
            }
            else {
                throw new customError_1.CustomError("Usuário selecionado não encontrado na sessão");
            }
        }
        catch (e) {
            log_1.logger.error(`onError:${sender.ws}, message:${e.message}`);
            const note = new notification_1.NotificationError(sender, e === null || e === void 0 ? void 0 : e.message, e === null || e === void 0 ? void 0 : e.critical);
            notificationService_1.NotificationService.getInstance().addNotification(note);
        }
    }
    lockSession(sender) {
        var _a, _b;
        let session = this.getSession(sender.key);
        try {
            if (session == undefined) {
                throw new customError_1.CustomError("Sessão informada é inválida");
            }
            else if (session.getCreator().login != sender.login) {
                throw new customError_1.CustomError("Usuário não possui acesso a esta funcionalidade");
            }
            else {
                (_a = this.getSession(sender.key)) === null || _a === void 0 ? void 0 : _a.deleteClients(sender);
                (_b = this.getSession(sender.key)) === null || _b === void 0 ? void 0 : _b.setState(consts_1.SESSION.CLOSED);
            }
        }
        catch (e) {
            log_1.logger.error(`onError:${sender.ws}, message:${e.message}`);
            const note = new notification_1.NotificationError(sender, e === null || e === void 0 ? void 0 : e.message, e === null || e === void 0 ? void 0 : e.critical);
            notificationService_1.NotificationService.getInstance().addNotification(note);
        }
    }
    openSession(sender) {
        var _a;
        let session = this.getSession(sender.key);
        try {
            if (session == undefined) {
                throw new customError_1.CustomError("Sessão informada é inválida");
            }
            else if (session.getCreator().login != sender.login) {
                throw new customError_1.CustomError("Usuário não possui acesso a esta funcionalidade");
            }
            else {
                (_a = this.getSession(sender.key)) === null || _a === void 0 ? void 0 : _a.setState(consts_1.SESSION.OPEN);
            }
        }
        catch (e) {
            log_1.logger.error(`onError:${sender.ws}, message:${e.message}`);
            const note = new notification_1.NotificationError(sender, e === null || e === void 0 ? void 0 : e.message, e === null || e === void 0 ? void 0 : e.critical);
            notificationService_1.NotificationService.getInstance().addNotification(note);
        }
    }
    closeSession(sender) {
        var _a;
        (_a = this.getSession(sender.key)) === null || _a === void 0 ? void 0 : _a.deleteClients();
    }
    returnSessions(cli) {
        var _a;
        const note = new notification_1.NotificationSession(cli, new notification_1.Note(consts_1.STATUS.OK, consts_1.TYPE.OK, {
            "action": "returnSessions",
            "content": (_a = DelpSessions.getInstance().getSession(cli.key)) === null || _a === void 0 ? void 0 : _a.toJSON(),
        }, "Sucesso"));
        notificationService_1.NotificationService.getInstance().addNotification(note);
    }
    returnClients(cli) {
        var _a;
        const note = new notification_1.NotificationSession(cli, new notification_1.Note(consts_1.STATUS.OK, consts_1.TYPE.OK, {
            "action": "returnClients",
            "content": (_a = DelpSessions.getInstance()
                .getSession(cli.key)) === null || _a === void 0 ? void 0 : _a.getClients().toArray(),
        }, "Sucesso"));
        notificationService_1.NotificationService.getInstance().addNotification(note);
    }
}
exports.DelpSessions = DelpSessions;
