import { Client, DefaultClient } from "../Client/clients";
import { STATUS, TYPE } from "../Consts/consts";
import { Note, NotificationSession } from "../Notification/notification";
import { NotificationService } from "../Notification/notificationService";
import { DelpSession } from "./session";
import {logger} from "../../src/log";


export class DelpSessions { 
    
    private sessions : Map<string,DelpSession>;

    private static instance : DelpSessions;

    constructor(){

        this.sessions = new Map<string,DelpSession>();

    }

    //RETORNA INSTANCÂNCIA DO SINGLETON
    public static getInstance(){

        if (!DelpSessions.instance) {
            DelpSessions.instance = new DelpSessions();
        }

        return DelpSessions.instance;
    }

    //METODO QUE É CHAMADO QUANDO UMA CONEXÃO É ENCERRADA
    public onClose(cli : Client,ws:any){
    
        this.sessions.get(cli.key)?.clients.delete(cli)
        logger.info(`onClose: ${cli.ws}`);

    }

    //MÉTODO QUE É CHAMADO AO OCORRER UM ERRO NO WS-CLIENT
    public onError(cli:Client,err:any){

        logger.error(`onError:${cli.ws}, message:${err.message}`);
        const note = new NotificationSession(cli,new Note(STATUS.ERROR,TYPE.ERROR,JSON.stringify({content:err,action:0}),`Erro do cliente ${cli.login} `))
        NotificationService.getInstance().addNotification(note);
    }

    //MÉTODO QUE É CHAMADO AO CLIENT ENVIAR UMA MENSAGEM PARA A SESSÃO
    public onMessage(cli:Client,data:any){

        logger.info(`onMessage: ${data}`);
        const note = new NotificationSession(cli,new Note(STATUS.WAIT,TYPE.INFO,JSON.stringify({content:"Processando...",action:-1}),"Aguarde"))
        NotificationService.getInstance().addNotification(note);
        let jsonObject : any = JSON.parse(data);
        if(jsonObject.type==TYPE.ACTION){
            this.processAction(jsonObject,cli)
        }
        
    }

    //MÉTODO UTILIZADO PARA ADICIONAR UM CLIENT À SESSÃO CORRETA
    public addClient(cli:Client){

        cli.ws.on('message',( data : any) => this.onMessage(cli, data));
        cli.ws.on('error', (error : any) => this.onError(cli, error));
        cli.ws.on('close',(ws : any) => this.onClose(cli,ws));
        this.sessions.get(cli.key)?.clients.add(cli);
        const note = new NotificationSession(cli,new Note(STATUS.OK,TYPE.INFO,JSON.stringify({content:`Conexão estabelecida com a sessão ${cli.key}`,action:2}),"Sucesso"))
        NotificationService.getInstance().addNotification(note);

    }

    public addSession(new_session : DelpSession, key : string){

        this.sessions.set(key,new_session);

    }

    public getSession(key : string){
        return this.sessions.get(key);
    }

    public hasSession(key : string){
        return this.sessions.has(key);
    }

    public deleteClient(cli:Client,key:string){

    }    

    public notifySession(key:string,note:Note,sender:Client=DefaultClient){

        this.getSession(key)?.notifyAll(sender,note)

    }

    private processAction(data:any,cli:Client){

    }


}
