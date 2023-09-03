"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DefaultClient = exports.Client = exports.Clients = void 0;
class Client {
    constructor(ws = null, login = "Servidor", name = "Delp", key = "") {
        this.ws = ws;
        this.login = login;
        this.name = name;
        this.key = key;
    }
}
exports.Client = Client;
;
class Clients_Alone {
    constructor() {
        this.clients = new Set();
    }
}
const Clients = new Clients_Alone();
exports.Clients = Clients;
const DefaultClient = new Client();
exports.DefaultClient = DefaultClient;
