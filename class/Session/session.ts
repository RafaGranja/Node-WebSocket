import { Client, Clients, DefaultClient, SessionClients } from "../Client/clients";
import { SESSION, STATUS, TYPE } from "../Consts/consts";
import { Note, NotificationSession } from "../Notification/notification";
import { NotificationService } from "../Notification/notificationService";
import { DelpSessions } from "./controlSessions";

export class DelpSession {
  public clients: SessionClients;
  public key: string;
  private opentime: Date;
  private creator: Client;
  private state: number;

  public notifyAll(sender: Client, note: Note) {
    this.clients.getAllClients().forEach(function (cli) {
      if (sender.ws != cli.ws) {
        let not = new NotificationSession(cli, note, sender);
        NotificationService.getInstance().addNotification(not);
      }
    });
  }

  public getCLientBySocket(ws: any) {
    return this.clients.getClient(ws);
  }

  public getClientByLogin(login: string) {
    let ret : any = undefined;
    this.clients.getClients().forEach((cli)=>{
      if (login == cli.login) {
        ret = cli;
      }
    });

    return ret;
  }

  public getClients() {
    return this.clients;
  }

  public deleteClient(cli: Client) {
    this.clients.removeClient(cli);
    cli.ws.terminate();
  }

  public deleteClientMap(cli: Client) {
    this.clients.removeClient(cli);
  }

  public deleteClients(sender?: Client) {
    this.clients.getClients().forEach((cli) => {
      if (sender?.login != cli.login && !cli.spectate) {
        this.deleteClient(cli);
      }
    });
  }

  public toJSON() {
    return { key: this.key, creator: this.creator.login, state: this.state };
  }

  constructor(key: string, cli: Client) {
    this.key = key;
    this.clients = new SessionClients();
    this.clients.addClient(cli.ws, cli);
    this.opentime = new Date();
    if(cli.spectate){
      this.creator= DefaultClient
    }
    else{
      this.creator = cli;
    }
    this.state = SESSION.OPEN;
  }

  public addClient(cli: Client) {
    this.clients.addClient(cli.ws, cli);
    this.notifyAll(cli,new Note(
      STATUS.WAIT,
      TYPE.INFO,
      { "action": "addClient", "content": this.getClients().getClients().size, "client" : cli.toJSON() },
      "Sucesso"
    ))
    if(this.creator==DefaultClient && !cli.spectate) {
      this.setCreator(cli)
    }
  }

  public getCreator() {
    return this.creator;
  }

  public setCreator(cli: Client) {
    this.creator = cli;
    this.notifyAll(DefaultClient,new Note(
      STATUS.WAIT,
      TYPE.INFO,
      { "action": "newCreator", "content": this.getClients().getClients().size, "client" : cli.toJSON() },
      "Sucesso"
    ))
  }

  public getState() {
    return this.state;
  }

  public setState(state: number) {
    this.state = state;
    if(state==SESSION.OPEN){
      this.notifyAll(DefaultClient,new Note(
        STATUS.OK,
        TYPE.INFO,
        { "action": "openSession", "content": this.getClients().getClients().size, "client" : this.creator.toJSON() },
        "Sucesso"
      ))
    }
    else if(state==SESSION.CLOSED){
      this.notifyAll(DefaultClient,new Note(
        STATUS.OK,
        TYPE.INFO,
        { "action": "lockSession", "content": this.getClients().getClients().size, "client" : this.creator.toJSON() },
        "Sucesso"
      ))
    }
  }
}
