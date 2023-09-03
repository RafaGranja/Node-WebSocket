import { NotificationSession } from "./notification";
import { Queue } from "../Queue/queue";

export class NotificationService{

    private static instance : NotificationService;

    private queue : Queue<NotificationSession>;

    private queue_run : any;

    //  RETORNA INSTÂNCIA DO SINGLETON
    public static getInstance(){

        if (!NotificationService.instance) {
            NotificationService.instance = new NotificationService();
        }

        return NotificationService.instance;
    }

    constructor(){

        this.queue = new Queue<NotificationSession>();

    };

    //ADICIONA NOTIFICAÇÃO NA FILA
    public addNotification(notificaion : NotificationSession){
        this.queue.enqueue(notificaion)
        this.run()
    }

    //INICIA PROCESSAMENTO DA FILA
    public run(){

        this.queue_run = setInterval(function(){

            console.log("Iniciei o serviço de notificação")

           var notification : NotificationSession = NotificationService.getInstance().queue.dequeue()            

           notification.send();

           if(NotificationService.getInstance().queue.isEmpty){
                NotificationService.getInstance().stop();
           }

        },100)

    }

    //PARALIZA PROCESSAMENTO DA FILA
    public stop(){
        clearInterval(this.queue_run);
        console.log("Parei o serviço de notificação")
    }

}
