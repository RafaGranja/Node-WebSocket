const WebServer = require('ws');
import { initSession,NotifySession } from "./app-se";
import { logger } from "./log";
import { Clients_Alone,Client } from "../class/Client/clients";
import {STATUS, TYPE} from "../class/Consts/consts";
import { Note, NotificationSession } from "../class/Notification/notification";
import { NotificationService } from "../class/Notification/notificationService";
import { validaValor } from "../class/Utils/utils";

//METODO QUE É CHAMADO QUANDO UMA CONEXÃO É ENCERRADA
function onClose(ws : any){
    Clients_Alone.getInstance().removeClient(ws)
    logger.info(`onClose: ${ws}`);
}

//MÉTODO CHAMADO AO OCORRER UM ERRO DE PROCESSAMENTO
function onError(ws : any, err : any) {
    logger.error(`onError:${ws}, message:${err.message}`);
    const note = new NotificationSession(new Client(ws),new Note(STATUS.ERROR,TYPE.ERROR,err.message,"Erro"))
    NotificationService.getInstance().addNotification(note);
}
 
//MÉTODO UTILIZADO PARA RECEBER MENSAGENS DO CLIENT
function onMessage(ws : any, data : any) {
    logger.info(`onMessage: ${data}`);
    const note = new NotificationSession(new Client(ws),new Note(STATUS.WAIT,TYPE.INFO,JSON.stringify({action:-1,content:"Processando..."}),"Aguarde"))
    NotificationService.getInstance().addNotification(note);

    try{
        
        let jsonObject : any = JSON.parse(data);
        
        if(!validaValor(jsonObject.name)){
            throw Error("name informado não é válido");
        }
        else if(!validaValor(jsonObject.login)){
            throw Error("login informado não é válido");
        }
        else if(!validaValor(jsonObject.action)){
            throw Error("action informado não é válido");
        }
        else{

            switch (Number(jsonObject.action)) {
                case 1:
                    returnStatusConst(ws);
                    break;
                case 2:
                    initSession(jsonObject.key,ws,jsonObject.login,jsonObject.name);
                    break;
                case 3:
                    NotifySession(jsonObject.key,ws,jsonObject.type,jsonObject.title,jsonObject.message,Number(jsonObject.status))
                    break;
                default:
                    throw Error("action informado não é válido")
            }

        }

    }
    catch(e : any){

        const note = new NotificationSession(new Client(ws),new Note(STATUS.ERROR,TYPE.ERROR,e?.message ,"Erro"))
        NotificationService.getInstance().addNotification(note);
        
    }

}

function returnStatusConst(ws:any){

    const note = new NotificationSession(new Client(ws),new Note(STATUS.OK,TYPE.INFO,JSON.stringify({content:{status:STATUS.toJSON(),type:TYPE.toJSON()},action:1}) ,"CONSTS"));
    NotificationService.getInstance().addNotification(note);
}
 
//MÉTODO UTILIZADO AO INICIAR CONEXÕES CLIENT-SERVER
function onConnection(ws : any, req : any) {
    ws.on('message',( data : any) => onMessage(ws, data));
    ws.on('error', (error : any) => onError(ws, error));
    ws.on('close',(ws : any) => onClose(ws));
    Clients_Alone.getInstance().addClient(ws);
    logger.info(`onConnection`);
}

module.exports = (server:any) => {
    const wss : any = new WebServer.Server({
        server
    });
    
    //
    wss.on('connection',onConnection);
 
    logger.info(`App Web Socket Server is running!`);
    return wss;
}