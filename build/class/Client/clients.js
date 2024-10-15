"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DefaultClient = exports.Client = exports.Clients = exports.SessionClients = void 0;
const log_1 = require("../../src/log");
const consts_1 = require("../Consts/consts");
const notification_1 = require("../Notification/notification");
const controlSessions_1 = require("../Session/controlSessions");
class Client {
    constructor(ws = null, login = "Servidor", name = "Delp", key = "", spectate = "false") {
        this.ws = ws;
        this.login = login;
        this.name = name;
        this.key = key;
        this.time = new Date();
        this.spectate = spectate == 'false' ? false : true;
    }
    toJSON() {
        return { "login": this.login, "name": this.name, "key": this.key, "spectate": this.spectate };
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
<<<<<<< HEAD
        var _a, _b, _c, _d, _e, _f;
=======
        var _a, _b, _c, _d;
>>>>>>> 40d2efa40fc022f8738258d52d53e3dc35c48c4a
        this.clients.delete(ws.ws);
        (_a = controlSessions_1.DelpSessions.getInstance().getSession(ws.key)) === null || _a === void 0 ? void 0 : _a.notifyAll(ws, new notification_1.Note(consts_1.STATUS.OK, consts_1.TYPE.INFO, {
            "action": "deleteClient",
            "content": this.clients.size,
            "client": ws.toJSON()
        }, "Sucesso"));
        if (!((_b = controlSessions_1.DelpSessions.getInstance().getSession(ws.key)) === null || _b === void 0 ? void 0 : _b.getClients().getAllClients().size)) {
            controlSessions_1.DelpSessions.getInstance().removeSession(ws.key);
        }
        else if (((_c = controlSessions_1.DelpSessions.getInstance().getSession(ws.key)) === null || _c === void 0 ? void 0 : _c.getCreator().login) == ws.login) {
            let array = Array.from(this.clients.values());
            var array_aux = array.filter(function (a) { return a.spectate == false; });
            array_aux.sort((a, b) => { return Number(a.time <= b.time); });
            if (array_aux.length > 0) {
                log_1.logger.info("Array creator", array_aux);
                (_d = controlSessions_1.DelpSessions.getInstance().getSession(ws.key)) === null || _d === void 0 ? void 0 : _d.setCreator(array_aux[0]);
            }
            else {
<<<<<<< HEAD
                (_e = controlSessions_1.DelpSessions.getInstance().getSession(ws.key)) === null || _e === void 0 ? void 0 : _e.setCreator(DefaultClient);
                (_f = controlSessions_1.DelpSessions.getInstance().getSession(ws.key)) === null || _f === void 0 ? void 0 : _f.setState(consts_1.SESSION.OPEN);
=======
                controlSessions_1.DelpSessions.getInstance().removeSession(ws.key);
>>>>>>> 40d2efa40fc022f8738258d52d53e3dc35c48c4a
            }
        }
    }
    getClient(ws) {
        return this.clients.get(ws);
    }
    getAllClients() {
        return this.clients;
    }
    getClients() {
        let ret = new Map();
        this.clients.forEach(function (elem) {
            if (!elem.spectate) {
                ret.set(elem.ws, elem);
            }
        });
        return ret;
    }
    toJSON() {
        let ret = new Array();
        let i = 0;
        this.clients.forEach((item) => {
            if (!item.spectate) {
                ret.push(item.toJSON());
            }
            i++;
        });
        return JSON.stringify(ret);
    }
    toArray() {
        let ret = new Array();
        let i = 0;
        this.clients.forEach((item) => {
            if (!item.spectate) {
                ret.push(item.toJSON());
            }
            i++;
        });
        return ret;
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
    toArray() {
        let ret = new Array();
        let i = 0;
        this.clients.forEach((item) => {
            ret.push(item.toJSON());
            i++;
        });
        return ret;
    }
}
exports.Clients = Clients;
const DefaultClient = new Client();
exports.DefaultClient = DefaultClient;
