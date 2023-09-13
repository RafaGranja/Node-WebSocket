var WebSocket = require('ws');

consts  = {

    status : null,
    type : null,

}


class Client{

    constructor(login,name){
        this.login = login;
        this.name = name;
        this.carregando=1;
    }

    setKey(key){
        this.key = key;
    }

    getKey(){
        return this.key;
    }


    async init(){

        await new Promise(()=>{

            try{

                this.socket = new WebSocket("ws://localhost:8081");
                
                this.socket.addEventListener("open", (event) => {
                    this.socket.send(JSON.stringify({
                        login: this.login,
                        name: this.name,
                        key: this.key,
                        action:1
                    }));
                });
                
                this.socket.addEventListener("error", (event) => {
                    console.error(event);
                });
                
                this.socket.addEventListener("message", (event) => {
                    let data = this.JsonParse(event.data);
                    this.ResolveServer(data)
                })

            }
            catch(error){
                console.error(error);
            }

        })
    
    }

    initSession(){
        try{
            this.socket.send(JSON.stringify({
                login: this.login,
                name: this.name,
                key: this.getKey(),
                action:2
            }));

        }
        catch(error){
            console.error(error);
        }
    }

    notify(){

        if(this.carregando==0){
            this.socket.send(JSON.stringify({
                login: this.login,
                name: this.name,
                key: this.getKey(),
                type:consts.type.info,
                title:"Teste",
                message:"Teste",
                status:consts.status.ok,
                action:3
            }));
        }

    }

    ResolveServer(data){

        let message = data?.body?.message
        let action = message?.action;

        switch(Number(action)){

            case 1: 
                this.assignConsts(message.content)
                console.log("Processado",message)
                this.carregando=0;
                break;
            case 2: 
                console.log("Processado",message)
                break;
            case 3: 
                console.log("Processado",message)
                break;
            case -1:
                console.log("Processando...",message)
                break;
            case 0:
                console.error("Erro do socket",message)
                break;
            default: 
                console.log("Invalid action",message)

        }

    
    }

    assignConsts(object){
        for(let a of Object.keys(object)){
            consts[a] = object[a];
        }
    }

    JsonParse(string){

        var node = "";
        if(typeof(string)=="string" && string.toString().search("{")!=-1){
            node = JSON.parse(string);
        }
        else{
            node = string;
        }

        if(typeof(node)=="object"){

            for(var key in node){

                node[key] = this.JsonParse(node[key]);
                    
            }

        }

        return node;

    }

}

var a = new Client('rafael.granja','Rafael Granja')

a.setKey("Testando")
a.init();


setTimeout(()=>{

    a.initSession();
    
    setTimeout(()=>{
        a.notify();
    },5000)

},5000)