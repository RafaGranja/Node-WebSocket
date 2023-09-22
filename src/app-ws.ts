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

//METODO QUE É CHAMADO QUANDO UMA CONEXÃO É ENCERRADA
function onClose(cli: Client) {
  Clients.getInstance().removeClient(cli);
  logger.info(`onClose: ${cli}`);
}

//MÉTODO CHAMADO AO OCORRER UM ERRO DE PROCESSAMENTO
function onError(cli: Client, err: any) {
  logger.error(`onError:${cli}, message:${err.message}`);
  const note = new NotificationError(cli, err.message);
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
      JSON.stringify({ action: "await", content: `Processando...` }),
      "Aguarde"
    )
  );
  NotificationService.getInstance().addNotification(note);

  try {

    let jsonObject: any = JSON.parse(data);

    let cli_aux = Clients.getInstance().getClient(cli.ws);

    cli = cli_aux == undefined ? cli : cli_aux;

    if (!validaValor(jsonObject.action)) {
      throw Error("action informado não é válido");
    } else {
      switch (jsonObject.action) {
        case "returnConst":
          returnConst(cli.ws);
          break;
        case "autenticate":
          if (!validaValor(jsonObject.name)) {
            throw Error("name informado não é válido");
          } else if (!validaValor(jsonObject.login)) {
            throw Error("login informado não é válido");
          } else {
            autenticate(cli.ws, jsonObject.login, jsonObject.name);
          }
          break;
        case "initSession":
          logger.info(cli,jsonObject)
          if (cli == undefined || cli == null || cli.login==DefaultClient.login) {
            throw Error("Necessária autenticação prévia");
          } else if (!validaValor(cli.name)) {
            throw Error("name informado não é válido");
          } else if (!validaValor(cli.login)) {
            throw Error("login informado não é válido");
          } else {
            initSession(jsonObject.key, cli);
          }
          break;
        case 'returnSessions':
            returnSessions(cli);
            break;
        case 'returnClients':
            returnClients(cli);
            break;
        default:
          throw Error("action informado não é válido");
      }
    }
  } catch (e: any) {
    const note = new NotificationError(cli, e?.message);
    NotificationService.getInstance().addNotification(note);
  }
}

function returnConst(ws: any) {
  const note = new NotificationSession(
    new Client(ws),
    new Note(
      STATUS.OK,
      TYPE.INFO,
      JSON.stringify({ content: Consts(), action: "returnConst" }),
      "CONSTS"
    )
  );
  NotificationService.getInstance().addNotification(note);
}

//MÉTODO UTILIZADO AO INICIAR CONEXÕES CLIENT-SERVER
function onConnection(ws: any, req: any) {
  let cli = new Client(ws);
  ws.on("message", (data: any) => onMessage(cli, data));
  ws.on("error", (error: any) => onError(cli, error));
  ws.on("close", (ws: any) => onClose(cli));
  Clients.getInstance().addClient(ws, cli);
  logger.info(`onConnection`);
}

function returnSessions(cli:Client){
    const note = new NotificationSession(
        cli,
        new Note(
          STATUS.OK,
          TYPE.OK,
          JSON.stringify({ action: "returnSessions", content: DelpSessions.getInstance().toJSON()}),
          "Sucesso"
        )
      );
      NotificationService.getInstance().addNotification(note);
}

function returnClients(cli:Client){
    const note = new NotificationSession(
        cli,
        new Note(
          STATUS.OK,
          TYPE.OK,
          JSON.stringify({ action: "returnClients", content: Clients.getInstance().toJSON()}),
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


export {onMessage,onClose,onError};