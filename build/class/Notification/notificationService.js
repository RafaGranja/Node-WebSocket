"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.NotificationService = void 0;
const queue_1 = require("../Queue/queue");
class NotificationService {
    static getInstance() {
        if (!NotificationService.instance) {
            NotificationService.instance = new NotificationService();
        }
        return NotificationService.instance;
    }
    constructor() {
        this.queue = new queue_1.Queue();
        this.running = false;
    }
    addNotification(notificaion) {
        this.queue.enqueue(notificaion);
        this.run();
    }
    run() {
        this.running = true;
        this.queue_run = setInterval(() => {
            if (this.running) {
                let current_note = this.queue.dequeue();
                if (this.queue.isEmpty) {
                    this.running = false;
                    this.stop();
                }
                current_note.send();
            }
        }, 10);
    }
    stop() {
        if (!this.running) {
            clearInterval(this.queue_run);
        }
    }
}
exports.NotificationService = NotificationService;
