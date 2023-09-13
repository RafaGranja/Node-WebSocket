import { DelpSession } from "../class/Session/session";
import { Client,Clients_Alone, DefaultClient } from "../class/Client/clients";
import { DelpSessions } from "../class/Session/controlSessions";
import { logger } from "./log";
import { Note } from "../class/Notification/notification";
import { STATUS } from "../class/Consts/consts";

function initSession(key:string,ws : any, login : string, name : string) : Boolean{

    if(key==undefined || key==null || key==""){

        throw Error("key informada não é válida");

    }
    else{

        const cli : Client = new Client(ws,login,name,key);

        if(DelpSessions.getInstance().hasSession(key)){

            DelpSessions.getInstance().addClient(cli);

        }
        else{

            
            const new_session : DelpSession = new DelpSession(key,cli)
            DelpSessions.getInstance().addSession(new_session,key)
            DelpSessions.getInstance().addClient(cli);
            
        }
        Clients_Alone.getInstance().removeClient(ws);


    }

    return true;

}


function NotifySession(key:string,sender:any=DefaultClient,type?:string,title?:string,message?:string,status?:number){

    DelpSessions.getInstance().getSession(key)?.notifyAll(DefaultClient,new Note(status,type,JSON.stringify({content:message,action:3}),title))

}

export {initSession,NotifySession};