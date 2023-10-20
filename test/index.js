var WebSocket = require("ws");

consts = {
  status: null,
  type: null,
  session: null,
};

class Client {
  constructor(login, name) {
    this.login = login;
    this.name = name;
    this.carregando = 1;
  }

  setKey(key) {
    this.key = key;
  }

  getKey() {
    return this.key;
  }

  async init() {
    await new Promise(() => {
      try {
        this.socket = new WebSocket("ws://localhost:8081");

        this.socket.addEventListener("open", (event) => {
          this.socket.send(
            JSON.stringify({
              action: "returnConst",
            })
          );
        });

        this.socket.addEventListener("error", (event) => {
          console.error(event);
        });

        this.socket.addEventListener("message", (event) => {
          let data = this.JsonParse(event.data);
          this.ResolveServer(data);
        });

        this.socket.addEventListener("close", (event) => {
          console.error(event);
        });
      } catch (error) {
        console.error(error);
      }
    });
  }

  autenticate(){
    this.socket.send(
      JSON.stringify({
        action: "autenticate",
        login: this.login,
        name: this.name,
      })
    );
  }

  initSession() {
    try {
      this.socket.send(
        JSON.stringify({
          key: this.getKey(),
          action: "initSession",
        })
      );
    } catch (error) {
      console.error(error);
    }
  }

  notifySession(title,message) {
    this.socket.send(
      JSON.stringify({
        type: consts.type.action,
        title: title,
        message: message,
        status: consts.status.ok,
        action: "notifySession",
      })
    );
  }

  returnSessions() {
    this.socket.send(
      JSON.stringify({
        type: consts.type.info,
        status: consts.status.ok,
        action: "returnSessions",
      })
    );
  }

  returnClients() {
    this.socket.send(
      JSON.stringify({
        type: consts.type.info,
        status: consts.status.ok,
        action: "returnClients",
      })
    );
  }


  ResolveServer(data) {
    let message = data?.body?.message;
    let action = message?.action;

    switch (action) {
      case "returnConst":
        this.assignConsts(message.content);
        console.log("Processado", data);
        this.carregando = 0;
        break;
      case "await":
        console.log("Processando...", data,message.content);
        break;
      case "error":
        console.error("Erro do socket", data,message.content);
        break;
      default:
        console.log("Processado - " + action, data,message.content);
    }
  }

  assignConsts(object) {
    for (let a in object) {
      consts[a] = object[a];
    }
  }

  JsonParse(string) {
    var node = "";
    if (typeof string == "string" && string.toString().search("{") != -1) {
      node = JSON.parse(string);
    } else {
      node = string;
    }

    if (typeof node == "object") {
      for (let key in node) {
        node[key] = this.JsonParse(node[key]);
      }
    }

    return node;
  }
}

try{
  var a = new Client("rafael.granja", "Rafael Granja");

  a.setKey("Testando");
  a.init();

  console.log("Teste autenticação")
  setTimeout(() => {

    a.initSession();

    setTimeout(() => {

      a.autenticate();

      setTimeout(() => {

        a.returnClients();

        setTimeout(() => {

          a.initSession();
          
          setTimeout(() => {

            a.initSession();

            setTimeout(() => {

              a.notifySession();
        
            }, 5000);
      
          }, 5000);

        }, 5000);

      }, 5000);

    }, 5000);

  }, 5000);
}
catch(error){
  console.error(error)
}
