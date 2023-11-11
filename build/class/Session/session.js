"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DelpSession = void 0;
const clients_1 = require("../Client/clients");
const consts_1 = require("../Consts/consts");
const notification_1 = require("../Notification/notification");
const notificationService_1 = require("../Notification/notificationService");
class DelpSession {
    notifyAll(sender, note) {
        this.clients.getClients().forEach(function (cli) {
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
            if ((sender === null || sender === void 0 ? void 0 : sender.login) != cli.login) {
                this.deleteClient(cli);
            }
        });
    }
    toJSON() {
        return { key: this.key, creator: this.creator.login, state: this.state };
    }
    constructor(key, cli) {
        this.key = key;
        this.clients = new clients_1.SessionClients();
        this.clients.addClient(cli.ws, cli);
        this.opentime = new Date();
        this.creator = cli;
        this.state = consts_1.SESSION.OPEN;
    }
    addClient(cli) {
        this.clients.addClient(cli.ws, cli);
        this.notifyAll(cli, new notification_1.Note(consts_1.STATUS.WAIT, consts_1.TYPE.INFO, JSON.stringify({ action: "addClient", content: this.getClients().getClients().size, client: cli.toJSON() }), "Sucesso"));
    }
    getCreator() {
        return this.creator;
    }
    setCreator(cli) {
        this.creator = cli;
        this.notifyAll(clients_1.DefaultClient, new notification_1.Note(consts_1.STATUS.WAIT, consts_1.TYPE.INFO, JSON.stringify({ action: "newCreator", content: this.getClients().getClients().size, client: cli.toJSON() }), "Sucesso"));
    }
    getState() {
        return this.state;
    }
    setState(state) {
        this.state = state;
        if (state == consts_1.SESSION.OPEN) {
            this.notifyAll(clients_1.DefaultClient, new notification_1.Note(consts_1.STATUS.OK, consts_1.TYPE.INFO, JSON.stringify({ action: "openSession", content: this.getClients().getClients().size, client: this.creator.toJSON() }), "Sucesso"));
        }
        else if (state == consts_1.SESSION.CLOSED) {
            this.notifyAll(clients_1.DefaultClient, new notification_1.Note(consts_1.STATUS.OK, consts_1.TYPE.INFO, JSON.stringify({ action: "lockSession", content: this.getClients().getClients().size, client: this.creator.toJSON() }), "Sucesso"));
        }
    }
}
exports.DelpSession = DelpSession;
