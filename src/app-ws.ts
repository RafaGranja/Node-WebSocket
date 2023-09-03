const WebServer = require('ws');
import { initSession } from "./app-se";
import { Clients_Alone,Client } from "../class/Client/clients";
import {STATUS, TYPE} from "../class/Consts/consts";
import { Note, NotificationSession } from "../class/Notification/notification";
import { NotificationService } from "../class/Notification/notificationService";

//METODO QUE É CHAMADO QUANDO UMA CONEXÃO É ENCERRADA
function onClose(ws : any){
    Clients_Alone.getInstance().removeClient(ws)
    console.log(`onClose: ${ws}`);
}

//MÉTODO CHAMADO AO OCORRER UM ERRO DE PROCESSAMENTO
function onError(ws : any, err : any) {
    console.error(`onError:${ws}, message:${err.message}`);
    const note = new NotificationSession(new Client(ws),new Note(STATUS.ERROR,TYPE.ERROR,err.message,"Erro"))
    NotificationService.getInstance().addNotification(note);
}
 
//MÉTODO UTILIZADO PARA RECEBER MENSAGENS DO CLIENT
function onMessage(ws : any, data : any) {
    console.log(`onMessage: ${data}`);
    const note = new NotificationSession(new Client(ws),new Note(STATUS.WAIT,TYPE.INFO,"Processando...","Aguarde"))
    NotificationService.getInstance().addNotification(note);
    let jsonObject : any = JSON.parse(data);

    try{

        if(jsonObject.name==undefined || jsonObject.name==null || jsonObject.name==""){
            throw Error("name informado não é válido");
        }
        else if(jsonObject.login==undefined || jsonObject.login==null || jsonObject.login==""){
            throw Error("login informado não é válido");
        }
        else if(jsonObject.action==undefined || jsonObject.action==null || jsonObject.action==""){
            throw Error("action informado não é válido");
        }
        else{

            switch (jsonObject.action) {
                case 0:
                    returnStatusConst(ws);
                    break;
                case 1:
                    initSession(jsonObject.key,ws,jsonObject.login,jsonObject.name);
                    break;
            
                default:
                    throw Error("action informado não é válido")
            }

        }

    }
    catch(e : any){

       
        const note = new NotificationSession(new Client(ws),new Note(STATUS.ERROR,TYPE.ERROR,e ,"Erro"))
        NotificationService.getInstance().addNotification(note);
    }

}

function returnStatusConst(ws:any){

    ws.send({status:STATUS.OK,data:JSON.stringify(STATUS)})

}
 
//MÉTODO UTILIZADO AO INICIAR CONEXÕES CLIENT-SERVER
function onConnection(ws : any, req : any) {
    ws.on('message',( data : any) => onMessage(ws, data));
    ws.on('error', (error : any) => onError(ws, error));
    ws.on('close',(ws : any) => onClose(ws));
    Clients_Alone.getInstance().addClient(ws);
    console.log(`onConnection`);
}

module.exports = (server:any) => {
    const wss : any = new WebServer.Server({
        server
    });
    
    //
    wss.on('connection',onConnection);
 
    console.log(`App Web Socket Server is running!`);
    return wss;
}