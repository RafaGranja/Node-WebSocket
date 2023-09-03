class Client{
    
    public login : string;
    public name : string;
    public ws : any;
    public key :any;

    constructor(ws : any=null, login : string= "Servidor", name : string ="Delp",key:string=""){

        this.ws=ws;
        this.login=login;
        this.name=name;
        this.key=key;

    }

};

class Clients_Alone{

    private clients : Set<any>;

    private static instance : Clients_Alone;

    //  RETORNA INSTÂNCIA DO SINGLETON
    public static getInstance(){

        if (!Clients_Alone.instance) {
            Clients_Alone.instance = new Clients_Alone();
        }

        return Clients_Alone.instance;
    }

    constructor(){
        this.clients=new Set<any>;
    }

    public addClient(cli:any){

        this.clients.add(cli)

    }

    public removeClient(cli:any){

        this.clients.delete(cli)

    }

}

const DefaultClient = new Client();

export {Clients_Alone,Client,DefaultClient};