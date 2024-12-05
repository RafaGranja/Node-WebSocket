const WebServer = require("ws");
import { initSession, NotifySession, autenticate } from "./app-se";
import { logger } from "./log";
import { Clients, Client, DefaultClient } from "../class/Client/clients";
import { Consts, STATUS, TYPE } from "../class/Consts/consts";
import {
  Note,
  NotificationError,
  NotificationSession,
} from "../class/Notification/notification";
import { NotificationService } from "../class/Notification/notificationService";
import { validaValor } from "../class/Utils/utils";
import { DelpSessions } from "../class/Session/controlSessions";
import { CustomError } from "../class/Error/customError";

//METODO QUE É CHAMADO QUANDO UMA CONEXÃO É ENCERRADA
function onClose(cli: Client) {
  logger.info(`onClose app-ws: ${JSON.stringify(cli.toJSON())}`);
  cli.removeAllListeners()
  Clients.getInstance().removeClientLogin(cli.login,cli.key);
  if(cli.key!=''){
    DelpSessions.getInstance().getSession(cli.key)?.deleteClientMap(cli);
  }
  logger.info(`onClose app-ws: ${JSON.stringify(cli.toJSON())}`);
}

//MÉTODO CHAMADO AO OCORRER UM ERRO DE PROCESSAMENTO
function onError(cli: Client, err: any) {
  logger.error(`onError app-ws:${cli}, message:${err.message}`);
  const note = new NotificationError(cli, err.message,0);
  NotificationService.getInstance().addNotification(note);
}

//MÉTODO UTILIZADO PARA RECEBER MENSAGENS DO CLIENT
function onMessage(cli: Client, data: any) {
  logger.info(`onMessage: ${data}`);
  const note = new NotificationSession(
    cli,
    new Note(
      STATUS.WAIT,
      TYPE.INFO,
      { "action": "await", "content": `Processando...` },
      "Aguarde"
    )
  );
  NotificationService.getInstance().addNotification(note);

  try {
    let jsonObject: any = JSON.parse(data);

    let cli_aux = Clients.getInstance().getClient(cli.ws);

    cli = cli_aux == undefined ? cli : cli_aux;

    if (!validaValor(jsonObject.action)) {
      throw new CustomError("action informado não é válido",1);
    } else {
      switch (jsonObject.action) {
        case "returnConst":
          returnConst(cli.ws);
          break;
        case "autenticate":
          if (!validaValor(jsonObject.name)) {
            throw new CustomError("name informado não é válido",1);
          } else if (!validaValor(jsonObject.login)) {
            throw new CustomError("login informado não é válido",1);
          } else {
            autenticate(cli, jsonObject.login, jsonObject.name,jsonObject.spectate.toString());
          }
          break;
        case "initSession":
          logger.info(cli, jsonObject);
          if (
            cli == undefined ||
            cli == null ||
            cli.login == DefaultClient.login
          ) {
            throw new CustomError("Necessária autenticação prévia",1);
          } else if (!validaValor(cli.name)) {
            throw new CustomError("name informado não é válido",1);
          } else if (!validaValor(cli.login)) {
            throw new CustomError("login informado não é válido",1);
          } else {
            initSession(jsonObject.key, cli);
          }
          break;
        case "returnSessions":
          returnSessions(cli);
          break;
        case "returnClients":
          returnClients(cli);
          break;
        default:
          throw new CustomError("action informado não é válido",1);
      }
    }
  } catch (e: any) {
    const note = new NotificationError(cli, e?.message,e?.critical);
    NotificationService.getInstance().addNotification(note);
  }
}

function returnConst(ws: any) {
  const note = new NotificationSession(
    new Client(ws),
    new Note(
      STATUS.OK,
      TYPE.INFO,
      { "content": Consts(), "action": "returnConst" },
      "CONSTS"
    )
  );
  NotificationService.getInstance().addNotification(note);
}


//MÉTODO UTILIZADO AO INICIAR CONEXÕES CLIENT-SERVER
function onConnection(ws: any, req: any) {
  let cli = new Client(ws);
  cli.ws.on("message", (data: any) => onMessage(cli, data));
  cli.ws.on("error", (error: any) => onError(cli, error));
  cli.ws.on("close", (ws: any) => onClose(cli));
  Clients.getInstance().addClient(cli.ws, cli);
  logger.info(`onConnection app-ws`);
}

function returnSessions(cli: Client) {
  const note = new NotificationSession(
    cli,
    new Note(
      STATUS.OK,
      TYPE.OK,
      {
        "action": "returnSessions",
        "content": DelpSessions.getInstance().toJSON(),
      },
      "Sucesso"
    )
  );
  NotificationService.getInstance().addNotification(note);
}

function returnClients(cli: Client) {
  const note = new NotificationSession(
    cli,
    new Note(
      STATUS.OK,
      TYPE.OK,
     {
        "action": "returnClients",
        "content": Clients.getInstance().toArray(),
      },
      "Sucesso"
    )
  );
  NotificationService.getInstance().addNotification(note);
}

module.exports = (server: any) => {
  const wss: any = new WebServer.Server({
    server,
  });

  //
  wss.on("connection", onConnection);

  logger.info(`App Web Socket Server is running!`);
  return wss;
};

export { onMessage, onClose, onError };
