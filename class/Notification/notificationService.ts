import { NotificationSession } from "./notification";
import { Queue } from "../Queue/queue";
import { logger } from "../../src/log";
export class NotificationService {
  private static instance: NotificationService;

  private queue: Queue<NotificationSession>;

  private running: boolean;

  private queue_run: any;

  //RETORNA INSTÂNCIA DO SINGLETON
  public static getInstance() {
    if (!NotificationService.instance) {
      NotificationService.instance = new NotificationService();
    }

    return NotificationService.instance;
  }

  constructor() {
    this.queue = new Queue<NotificationSession>();
    this.running = false;
  }

  //ADICIONA NOTIFICAÇÃO NA FILA
  public addNotification(notificaion: NotificationSession) {
    this.queue.enqueue(notificaion);
    this.run();
  }

  //INICIA PROCESSAMENTO DA FILA
  public run() {
    this.running = true;

    this.queue_run = setInterval(() => {
      if (this.running) {
        let current_note: NotificationSession = this.queue.dequeue();

        if (this.queue.isEmpty) {
          this.running = false;
          this.stop();
        }

        current_note.send();
      }
    },10);
  }

  //PARALIZA PROCESSAMENTO DA FILA
  public stop() {
    if (!this.running) {
      clearInterval(this.queue_run);
    }
  }
}
