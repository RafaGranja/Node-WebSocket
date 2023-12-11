import { Client, DefaultClient, SessionCLients } from "../Client/clients";
import { SESSION, STATUS, TYPE } from "../Consts/consts";
import { Note, NotificationSession } from "../Notification/notification";
import { NotificationService } from "../Notification/notificationService";
import { DelpSessions } from "./controlSessions";

export class DelpSession {
  public clients: SessionCLients;
  public key: string;
  private opentime: Date;
  private creator: Client;
  private state: number;

  public notifyAll(sender: Client, note: Note) {
    this.clients.getClients().forEach(function (cli) {
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
    this.clients.getClients().forEach(function (cli) {
      if (login == cli.login) {
        return cli;
      }
    });
  }

  public getClients() {
    return this.clients;
  }

  public deleteClient(cli: Client) {
    this.clients.removeClient(cli);
    if(this.getCreator()==cli){
      this.setCreator(Array.from(this.getClients().getClients().values()).sort((a,b)=>{return Number(a.time<=b.time)})[0])
    }
    cli.ws.close();
  }

  public deleteClientMap(cli: Client) {
    this.clients.removeClient(cli);
  }

  public deleteClients(sender?: Client) {
    this.clients.getClients().forEach((cli) => {
      if (sender?.login != cli.login) {
        this.deleteClient(cli);
      }
    });
  }

  public toJSON() {
    return { key: this.key, creator: this.creator.login, state: this.state };
  }

  constructor(key: string, cli: Client) {
    this.key = key;
    this.clients = new SessionCLients();
    this.clients.addClient(cli.ws, cli);
    this.opentime = new Date();
    this.creator = cli;
    this.state = SESSION.OPEN;
  }

  public addClient(cli: Client) {
    this.clients.addClient(cli.ws, cli);
    this.notifyAll(cli,new Note(
      STATUS.WAIT,
      TYPE.INFO,
      JSON.stringify({ action: "addClient", content: this.getClients().getClients().size, client : cli.toJSON() }),
      "Sucesso"
    ))
  }

  public getCreator() {
    return this.creator;
  }

  public setCreator(cli: Client) {
    this.creator = cli;
    this.notifyAll(DefaultClient,new Note(
      STATUS.WAIT,
      TYPE.INFO,
      JSON.stringify({ action: "newCreator", content: this.getClients().getClients().size, client : cli.toJSON() }),
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
        JSON.stringify({ action: "openSession", content: this.getClients().getClients().size, client : this.creator.toJSON() }),
        "Sucesso"
      ))
    }
    else if(state==SESSION.CLOSED){
      this.notifyAll(DefaultClient,new Note(
        STATUS.OK,
        TYPE.INFO,
        JSON.stringify({ action: "lockSession", content: this.getClients().getClients().size, client : this.creator.toJSON() }),
        "Sucesso"
      ))
    }
  }
}
