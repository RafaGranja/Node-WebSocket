import { STATUS, TYPE } from "../Consts/consts";
import { Note, NotificationSession } from "../Notification/notification";
import { NotificationService } from "../Notification/notificationService";
import { DelpSessions } from "../Session/controlSessions";

class Client {
  public login: string;
  public name: string;
  public ws: any;
  public key: any;

  constructor(
    ws: any = null,
    login: string = "Servidor",
    name: string = "Delp",
    key: string = ""
  ) {
    this.ws = ws;
    this.login = login;
    this.name = name;
    this.key = key;
  }

  toJSON() {
    return { login: this.login, name: this.name, key: this.key };
  }
}

class SessionCLients {
  private clients: Map<any, Client>;

  constructor() {
    this.clients = new Map<any, Client>();
  }

  public addClient(ws: any, cli: Client) {
    this.clients.set(ws, cli);
  }

  public removeClient(ws: Client) {
    this.clients.delete(ws.ws);
    DelpSessions.getInstance().getSession(ws.key)?.notifyAll(ws,new Note(STATUS.OK,TYPE.INFO,
      JSON.stringify({
        action: "deleteClient",
        content: ws.login,
      }),
      "Sucesso"))
  }

  public getClient(ws: any) {
    return this.clients.get(ws);
  }

  public getClients() {
    return this.clients;
  }

  public toJSON() {
    let ret = new Array();
    let i = 0;
    this.clients.forEach((item) => {
      ret.push(item.toJSON());
      i++;
    });

    return JSON.stringify(ret);
  }
}

class Clients {
  private clients: Map<any, Client>;

  private static instance: Clients;

  //  RETORNA INSTÂNCIA DO SINGLETON
  public static getInstance() {
    if (!Clients.instance) {
      Clients.instance = new Clients();
    }

    return Clients.instance;
  }

  constructor() {
    this.clients = new Map<any, Client>();
  }

  public addClient(ws: any, cli: Client) {
    this.clients.set(ws, cli);
  }

  public removeClient(ws: any) {
    this.clients.delete(ws);
  }

  public removeClientLogin(login: string,key_session:string) {
    this.clients.forEach((value:Client,key:any)=>{
      if(value.login==login && value.key==key_session){
        this.clients.delete(key)
      }
    })
  }

  public getClient(ws: any) {
    return this.clients.get(ws);
  }

  public getClients() {
    return this.clients;
  }

  public toJSON() {
    let ret = new Array();
    let i = 0;
    this.clients.forEach((item) => {
      ret.push(item.toJSON());
      i++;
    });

    return JSON.stringify(ret);
  }
}

const DefaultClient = new Client();

export { SessionCLients, Clients, Client, DefaultClient };
