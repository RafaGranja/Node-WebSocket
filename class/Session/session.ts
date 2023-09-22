import { Client,SessionCLients } from "../Client/clients";
import { SESSION } from "../Consts/consts";
import { Note, NotificationSession } from "../Notification/notification";
import { NotificationService } from "../Notification/notificationService";

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

  public getClients(){
    return this.clients;
  }

  public deleteClient(cli: Client) {
    this.clients.removeClient(cli.ws);
    cli.ws.close();
  }

  public deleteClientMap(cli: Client) {
    this.clients.removeClient(cli.ws);
  }

  public deleteClients(sender?: Client) {
    this.clients.getClients().forEach((cli) => {
      if (sender != cli) {
        this.deleteClient(cli);
      }
    });
  }

  public toJSON(){
    return {key:this.key,creator:this.creator.login,state:this.state}
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
  }

  public getCreator() {
    return this.creator;
  }

  public setCreator(cli: Client) {
    this.creator = cli;
  }

  public getState() {
    return this.state;
  }

  public setState(state: number) {
    this.state = state;
  }
}
