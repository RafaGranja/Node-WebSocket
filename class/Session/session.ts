import { Client } from '../Client/clients';
import { Note, NotificationSession } from '../Notification/notification';
import { NotificationService } from '../Notification/notificationService';

export class DelpSession{

    public clients : Set<Client>;
    public key : string;
    private opentime : Date;
    private creator : string;

    public notifyAll(sender:Client,note:Note){

        this.clients.forEach(function(cli){

            if(sender!=cli){

                let not = new NotificationSession(cli,note,sender);
                NotificationService.getInstance().addNotification(not)

            }

        })

    }

    constructor(key:string,cli : Client){

        this.key=key;
        this.clients = new Set<Client>();
        this.clients.add(cli)
        this.opentime = new Date();
        this.creator=cli.login;

    }

}