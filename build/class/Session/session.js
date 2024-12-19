"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DelpSession = void 0;
const clients_1 = require("../Client/clients");
const consts_1 = require("../Consts/consts");
const notification_1 = require("../Notification/notification");
const notificationService_1 = require("../Notification/notificationService");
const controlSessions_1 = require("./controlSessions");
class DelpSession {
    notifyAll(sender, note) {
        this.clients.getAllClients().forEach(function (cli) {
            if (sender.ws != cli.ws) {
                let not = new notification_1.NotificationSession(cli, note, sender);
                notificationService_1.NotificationService.getInstance().addNotification(not);
            }
        });
    }
    getCLientBySocket(ws) {
        return this.clients.getClient(ws);
    }
    getClientByLogin(login) {
        let ret = undefined;
        this.clients.getClients().forEach((cli) => {
            if (login == cli.login) {
                ret = cli;
            }
        });
        return ret;
    }
    getClients() {
        return this.clients;
    }
    deleteClient(cli) {
        this.clients.removeClient(cli);
        cli.ws.terminate();
    }
    deleteClientMap(cli) {
        this.clients.removeClient(cli);
    }
    deleteClients(sender) {
        this.clients.getClients().forEach((cli) => {
            if ((sender === null || sender === void 0 ? void 0 : sender.login) != cli.login && !cli.spectate) {
                this.deleteClient(cli);
            }
        });
    }
    toJSON() {
        let ret = { "key": this.key, "creator": this.creator.login, "state": this.state };
        return ret;
    }
    constructor(key, cli) {
        this.key = key;
        this.clients = new clients_1.SessionClients();
        this.opentime = new Date();
        if (cli.spectate) {
            this.creator = clients_1.DefaultClient;
        }
        else {
            this.creator = cli;
        }
        this.state = consts_1.SESSION.OPEN;
        controlSessions_1.DelpSessions.getInstance().addSession(this, this.key);
        controlSessions_1.DelpSessions.getInstance().addClient(cli);
    }
    addClient(cli) {
        this.clients.addClient(cli.ws, cli);
        this.notifyAll(cli, new notification_1.Note(consts_1.STATUS.WAIT, consts_1.TYPE.INFO, { "action": "addClient", "content": this.getClients().getClients().size, "client": cli.toJSON() }, "Sucesso"));
        if (this.creator == clients_1.DefaultClient && !cli.spectate) {
            this.setCreator(cli);
        }
    }
    getCreator() {
        return this.creator;
    }
    setCreator(cli) {
        this.creator = cli;
        this.notifyAll(clients_1.DefaultClient, new notification_1.Note(consts_1.STATUS.WAIT, consts_1.TYPE.INFO, { "action": "newCreator", "content": this.getClients().getClients().size, "client": cli.toJSON() }, "Sucesso"));
    }
    getState() {
        return this.state;
    }
    setState(state) {
        this.state = state;
        if (state == consts_1.SESSION.OPEN) {
            this.notifyAll(clients_1.DefaultClient, new notification_1.Note(consts_1.STATUS.OK, consts_1.TYPE.INFO, { "action": "openSession", "content": this.getClients().getClients().size, "client": this.creator.toJSON() }, "Sucesso"));
        }
        else if (state == consts_1.SESSION.CLOSED) {
            this.notifyAll(clients_1.DefaultClient, new notification_1.Note(consts_1.STATUS.OK, consts_1.TYPE.INFO, { "action": "lockSession", "content": this.getClients().getClients().size, "client": this.creator.toJSON() }, "Sucesso"));
        }
    }
}
exports.DelpSession = DelpSession;
