"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DefaultClient = exports.Client = exports.Clients = exports.SessionClients = void 0;
const consts_1 = require("../Consts/consts");
const notification_1 = require("../Notification/notification");
const controlSessions_1 = require("../Session/controlSessions");
class Client {
    constructor(ws = null, login = "Servidor", name = "Delp", key = "") {
        this.ws = ws;
        this.login = login;
        this.name = name;
        this.key = key;
        this.time = new Date();
    }
    toJSON() {
        return { login: this.login, name: this.name, key: this.key };
    }
}
exports.Client = Client;
class SessionClients {
    constructor() {
        this.clients = new Map();
    }
    addClient(ws, cli) {
        cli.time = new Date();
        this.clients.set(ws, cli);
    }
    removeClient(ws) {
        var _a, _b;
        this.clients.delete(ws.ws);
        (_a = controlSessions_1.DelpSessions.getInstance().getSession(ws.key)) === null || _a === void 0 ? void 0 : _a.notifyAll(ws, new notification_1.Note(consts_1.STATUS.OK, consts_1.TYPE.INFO, JSON.stringify({
            action: "deleteClient",
            content: this.clients.size,
            client: ws.toJSON()
        }), "Sucesso"));
        if (!((_b = controlSessions_1.DelpSessions.getInstance().getSession(ws.key)) === null || _b === void 0 ? void 0 : _b.getClients().getClients().size)) {
            controlSessions_1.DelpSessions.getInstance().getSessions().delete(ws.key);
        }
    }
    getClient(ws) {
        return this.clients.get(ws);
    }
    getClients() {
        return this.clients;
    }
    toJSON() {
        let ret = new Array();
        let i = 0;
        this.clients.forEach((item) => {
            ret.push(item.toJSON());
            i++;
        });
        return JSON.stringify(ret);
    }
}
exports.SessionClients = SessionClients;
class Clients {
    static getInstance() {
        if (!Clients.instance) {
            Clients.instance = new Clients();
        }
        return Clients.instance;
    }
    constructor() {
        this.clients = new Map();
    }
    addClient(ws, cli) {
        cli.time = new Date();
        this.clients.set(ws, cli);
    }
    removeClient(ws) {
        this.clients.delete(ws);
    }
    removeClientLogin(login, key_session) {
        this.clients.forEach((value, key) => {
            if (value.login == login && value.key == key_session) {
                this.clients.delete(key);
            }
        });
    }
    getClient(ws) {
        return this.clients.get(ws);
    }
    getClients() {
        return this.clients;
    }
    toJSON() {
        let ret = new Array();
        let i = 0;
        this.clients.forEach((item) => {
            ret.push(item.toJSON());
            i++;
        });
        return JSON.stringify(ret);
    }
}
exports.Clients = Clients;
const DefaultClient = new Client();
exports.DefaultClient = DefaultClient;
