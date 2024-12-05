import { spec } from "node:test/reporters";
import { logger } from "../../src/log";
import { SESSION, STATUS, TYPE } from "../Consts/consts";
import { Note, NotificationSession } from "../Notification/notification";
import { NotificationService } from "../Notification/notificationService";
import { DelpSessions } from "../Session/controlSessions";



class Client {
  public login: string;
  public name: string;
  public ws: any;
  public key: any;
  public time : Date;
  public spectate : boolean;
  public verification : any;
  private isAlive : boolean;

  constructor(
    ws: any = null,
    login: string = "Servidor",
    name: string = "Delp",
    key: string = "",
    spectate : string = "false"
  ) {
    this.ws = ws;
    this.login = login;
    this.name = name;
    this.key = key;
    this.time = new Date()
    this.spectate = spectate == 'false' ? false : true;
    this.isAlive = true;
    if(this.ws!=null && this.ws!=undefined){
      this.connection()
    }
  }

  connection(){
    this.ws.on('pong', this.heartbeat);

    this.verification = setInterval(()=>{
      if (this.isAlive === false) {
        DelpSessions.getInstance().getSession(this.key)?.deleteClientMap(this);
        Clients.getInstance().removeClient(this);
      }

      this.isAlive = false;
      this.ws.ping();
    },5000)

    this.ws.on("close",()=>{
      clearInterval(this.verification);
    });
  }

  heartbeat() {
    this.isAlive = true;
  }
  

  toJSON() {
    return { "login": this.login, "name": this.name, "key": this.key, "spectate":this.spectate };
  }
}

class SessionClients {
  private clients: Map<any, Client>;

  constructor() {
    this.clients = new Map<any, Client>();
  }

  public addClient(ws: any, cli: Client) {
    cli.time= new Date();
    this.clients.set(ws, cli);
  }

  public removeClient(ws: Client) {
    this.clients.delete(ws.ws);
    DelpSessions.getInstance().getSession(ws.key)?.notifyAll(ws,new Note(STATUS.OK,TYPE.INFO,
      {
        "action": "deleteClient",
        "content": this.clients.size,
        "client" : ws.toJSON()
      },
      "Sucesso")
    )

    if(!DelpSessions.getInstance().getSession(ws.key)?.getClients().getAllClients().size){
      DelpSessions.getInstance().removeSession(ws.key)
    } 
    else if(DelpSessions.getInstance().getSession(ws.key)?.getCreator().login==ws.login){
      let array = Array.from(this.clients.values())
      var array_aux = array.filter(function(a){return a.spectate==false})
      array_aux.sort((a,b)=>{return Number(a.time<=b.time)})
      if(array_aux.length>0){
        logger.info("Array creator",array_aux)
        DelpSessions.getInstance().getSession(ws.key)?.setCreator(
          array_aux[0]
        )
      }
      else{
        DelpSessions.getInstance().removeSession(ws.key)
      }
    }
  }

  public getClient(ws: any) {
    return this.clients.get(ws);
  }

  public getAllClients() {
    return this.clients;
  }

  public getClients() {
    let ret  = new Map<any, Client>();
    this.clients.forEach(function(elem){
      if(!elem.spectate){
        ret.set(elem.ws,elem)
      }
    })
    return ret;
  }

  public toJSON() {
    let ret = new Array();
    let i = 0;
    this.clients.forEach((item) => {
      if(!item.spectate){
        ret.push(item.toJSON());
      }
      i++;
    });

    return JSON.stringify(ret);
  }

  
  public toArray() {
    let ret = new Array();
    let i = 0;
    this.clients.forEach((item) => {
      if(!item.spectate){
        ret.push(item.toJSON());
      }
      i++;
    });

    return ret;
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
    cli.time= new Date();
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

  public toArray() {
    let ret = new Array();
    let i = 0;
    this.clients.forEach((item) => {
      ret.push(item.toJSON());
      i++;
    });

    return ret;
  }
}

const DefaultClient = new Client();

export { SessionClients, Clients, Client, DefaultClient };
