"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DelpSession = void 0;
const notification_1 = require("../Notification/notification");
const notificationService_1 = require("../Notification/notificationService");
class DelpSession {
    notifyAll(sender, note) {
        this.clients.forEach(function (cli) {
            if (sender != cli) {
                let not = new notification_1.NotificationSession(cli, note, sender);
                notificationService_1.NotificationService.getInstance().addNotification(not);
            }
        });
    }
    constructor(key, cli) {
        this.key = key;
        this.clients = new Set();
        this.clients.add(cli);
        this.opentime = new Date();
        this.creator = cli.login;
    }
}
exports.DelpSession = DelpSession;
