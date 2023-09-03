"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.NotificationService = void 0;
const queue_1 = require("./queue");
class NotificationService {
    static getInstance() {
        if (!NotificationService.instance) {
            NotificationService.instance = new NotificationService();
        }
        return NotificationService.instance;
    }
    constructor() {
        this.queue = new queue_1.Queue();
        this.run();
    }
    ;
    addNotification(notificaion) {
        this.queue.enqueue(notificaion);
        this.run();
    }
    run() {
        this.queue_run = setInterval(function () {
            var notification = NotificationService.getInstance().queue.dequeue();
            notification.send();
            if (NotificationService.getInstance().queue.isEmpty) {
                NotificationService.getInstance().stop();
            }
        }, 100);
    }
    stop() {
        clearInterval(this.queue_run);
    }
}
exports.NotificationService = NotificationService;
