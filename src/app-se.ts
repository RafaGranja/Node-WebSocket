import { DelpSession } from "../class/Session/session";
import { Client,Clients_Alone } from "../class/Client/clients";
import { DelpSessions } from "../class/Session/controlSessions";

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


function NotifySession(key:string,type?:string,title?:string,message?:string){

}

export {initSession};