"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DefaultClient = exports.Client = exports.Clients_Alone = void 0;
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
    //  RETORNA INSTÂNCIA DO SINGLETON
    static getInstance() {
        if (!Clients_Alone.instance) {
            Clients_Alone.instance = new Clients_Alone();
        }
        return Clients_Alone.instance;
    }
    constructor() {
        this.clients = new Set;
    }
    addClient(cli) {
        this.clients.add(cli);
    }
    removeClient(cli) {
        this.clients.delete(cli);
    }
}
exports.Clients_Alone = Clients_Alone;
const DefaultClient = new Client();
exports.DefaultClient = DefaultClient;
