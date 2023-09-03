"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DelpSessions = void 0;
const clients_1 = require("./clients");
const consts_1 = require("./consts");
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
    //METODO QUE É CHAMADO QUANDO UMA CONEXÃO É ENCERRADA
    onClose(cli) {
        var _a;
        (_a = this.sessions.get(cli.key)) === null || _a === void 0 ? void 0 : _a.clients.delete(cli);
        console.log(`onClose: ${cli.ws}`);
    }
    onError(cli, err) {
        console.error(`onError:${cli.ws}, message:${err.message}`);
    }
    onMessage(cli, data) {
        console.log(`onMessage: ${data}`);
        cli.ws.send({ status: consts_1.STATUS.WAIT, msg: `recebido e processando` });
        let jsonObject = JSON.parse(data);
    }
    addClient(cli) {
        var _a;
        cli.ws.on('message', (data) => this.onMessage(cli, data));
        cli.ws.on('error', (error) => this.onError(cli, error));
        cli.ws.on('close', (ws) => this.onClose(cli));
        (_a = this.sessions.get(cli.key)) === null || _a === void 0 ? void 0 : _a.clients.add(cli);
        cli.ws.send({ status: consts_1.STATUS.OK, msg: `Conectado a sessão ${cli.key}`, key: cli.key });
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
}
exports.DelpSessions = DelpSessions;
