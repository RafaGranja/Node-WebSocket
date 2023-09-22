"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DefaultClient = exports.Client = exports.Clients = exports.SessionCLients = void 0;
class Client {
    constructor(ws = null, login = "Servidor", name = "Delp", key = "") {
        this.ws = ws;
        this.login = login;
        this.name = name;
        this.key = key;
    }
    toJSON() {
        return { login: this.login, name: this.name, key: this.key };
    }
}
exports.Client = Client;
class SessionCLients {
    constructor() {
        this.clients = new Map();
    }
    addClient(ws, cli) {
        this.clients.set(ws, cli);
    }
    removeClient(ws) {
        this.clients.delete(ws);
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
exports.SessionCLients = SessionCLients;
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
        this.clients.set(ws, cli);
    }
    removeClient(ws) {
        this.clients.delete(ws);
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
