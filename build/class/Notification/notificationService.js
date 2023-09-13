"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.NotificationService = void 0;
const queue_1 = require("../Queue/queue");
const log_1 = require("../../src/log");
class NotificationService {
    //RETORNA INSTÂNCIA DO SINGLETON
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
    ;
    //ADICIONA NOTIFICAÇÃO NA FILA
    addNotification(notificaion) {
        this.queue.enqueue(notificaion);
        this.run();
    }
    //INICIA PROCESSAMENTO DA FILA
    run() {
        log_1.logger.info("Iniciei o serviço de notificação");
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
        }, 50);
    }
    //PARALIZA PROCESSAMENTO DA FILA
    stop() {
        if (!this.running) {
            clearInterval(this.queue_run);
            log_1.logger.info("Parei o serviço de notificação");
        }
    }
}
exports.NotificationService = NotificationService;
