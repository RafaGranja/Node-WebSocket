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
        this.clients.getClients().forEach(function (cli) {
            if (login == cli.login) {
                return cli;
            }
        });
    }
    getClients() {
        return this.clients;
    }
    deleteClient(cli) {
        this.clients.removeClient(cli);
        cli.ws.close();
    }
    deleteClientMap(cli) {
        this.clients.removeClient(cli);
    }
    deleteClients(sender) {
        this.clients.getClients().forEach((cli) => {
            if (sender != cli) {
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
    }
    getCreator() {
        return this.creator;
    }
    setCreator(cli) {
        this.creator = cli;
    }
    getState() {
        return this.state;
    }
    setState(state) {
        this.state = state;
    }
}
exports.DelpSession = DelpSession;
