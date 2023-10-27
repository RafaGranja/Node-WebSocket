import { Client, Clients, DefaultClient } from "../Client/clients";
import { Consts, SESSION, STATUS, TYPE } from "../Consts/consts";
import {
  Note,
  NotificationSession,
  NotificationError,
} from "../Notification/notification";
import { NotificationService } from "../Notification/notificationService";
import { DelpSession } from "./session";
import { logger } from "../../src/log";
import { validaValor } from "../Utils/utils";
import { json } from "stream/consumers";
import { CustomError } from "../Error/customError";

export class DelpSessions {
  private sessions: Map<string, DelpSession>;

  private static instance: DelpSessions;

  constructor() {
    this.sessions = new Map<string, DelpSession>();
  }

  //RETORNA INSTANCÂNCIA DO SINGLETON
  public static getInstance() {
    if (!DelpSessions.instance) {
      DelpSessions.instance = new DelpSessions();
    }

    return DelpSessions.instance;
  }

  //METODO QUE É CHAMADO QUANDO UMA CONEXÃO É ENCERRADA
  public onClose(cli: Client) {
    this.sessions.get(cli.key)?.deleteClientMap(cli);
    Clients.getInstance().removeClient(cli);
    logger.info(`onClose: ${cli}`);
  }

  //MÉTODO QUE É CHAMADO AO OCORRER UM ERRO NO WS-CLIENT
  public onError(cli: Client, err: any) {
    logger.error(`onError:${cli.ws}, message:${err.message}`);
    const note = new NotificationError(cli, err,0);
    NotificationService.getInstance().addNotification(note);
  }

  //MÉTODO QUE É CHAMADO AO CLIENT ENVIAR UMA MENSAGEM PARA A SESSÃO
  public onMessage(cli: Client, data: any) {
    let jsonObject: any = JSON.parse(data);
    this.processAction(jsonObject, cli);
  }

  //MÉTODO UTILIZADO PARA ADICIONAR UM CLIENT À SESSÃO CORRETA
  public addClient(cli: Client) {
    cli.ws.on("message", (data: any) => this.onMessage(cli, data));
    cli.ws.on("error", (error: any) => this.onError(cli, error));
    cli.ws.on("close", () => this.onClose(cli));
    this.sessions.get(cli.key)?.addClient(cli);
    Clients.getInstance().removeClient(cli.ws);
    const note = new NotificationSession(
      cli,
      new Note(
        STATUS.OK,
        TYPE.INFO,
        JSON.stringify({
          content: `Conexão estabelecida com a sessão ${cli.key}`,
          action: "initSession",
          creator:this.sessions.get(cli.key)?.getCreator().login
        }),
        "Sucesso"
      )
    );
    NotificationService.getInstance().addNotification(note);
  }

  public toJSON() {
    let ret;
    let i = 0;
    this.sessions.forEach((item) => {
      ret[i] = item.toJSON();
      i++;
    });

    return JSON.stringify(ret);
  }

  public addSession(new_session: DelpSession, key: string) {
    this.sessions.set(key, new_session);
  }

  public getSession(key: string) {
    return this.sessions.get(key);
  }

  public getSessions() {
    return this.sessions;
  }

  public hasSession(key: string) {
    return this.sessions.has(key);
  }

  public getClientByLogin(key: string, login: string) {
    return this.getSession(key)?.getClientByLogin(login);
  }

  public notifySession(
    key: string,
    note: Note,
    sender: Client = DefaultClient
  ) {
    this.getSession(key)?.notifyAll(sender, note);
  }

  private processAction(jsonObject: any, cli: Client) {
    const note = new NotificationSession(
      cli,
      new Note(
        STATUS.WAIT,
        TYPE.INFO,
        JSON.stringify({ action: "await", content: "Processando..." }),
        "Aguarde"
      )
    );
    NotificationService.getInstance().addNotification(note);

    try {
      if (!validaValor(jsonObject.action)) {
        throw new CustomError("action informado não é válido",1);
      } else {
        switch (jsonObject.action) {
          case "notifySession":
          case "execScript":
            this.notifySession(
              cli.key,
              new Note(
                jsonObject.status,
                jsonObject.type,
                JSON.stringify({
                  content: jsonObject.message,
                  action: jsonObject.action,
                }),
                jsonObject.title
              ),
              cli
            );
            break;
          case "statusSession":
            if (!validaValor(jsonObject.state)) {
              throw new CustomError("Necessário informar um estado para sessão",0);

            } else {
              this.statusSession(jsonObject.state, cli);
            }
            break;
          case "closeSession":
            this.closeSession(cli);
            break;
          case "deleteClient":
            this.deleteClient(cli, jsonObject.targetLogin);
            break;
          case "lockSession":
            this.lockSession(cli);
            break;
          case "returnSessions":
            this.returnSessions(cli);
            break;
          case "returnClients":
            this.returnClients(cli);
            break;
          default:
            throw Error(JSON.stringify({
              message:"action informado - " + jsonObject.action + " - não é válido",critical:1
            }));
        }
      }
    } catch (e: any) {
      e = JSON.parse(e);
      const note = new NotificationError(cli, e?.message,e?.critical);
      NotificationService.getInstance().addNotification(note);
    }
  }

  private statusSession(state: number, sender: Client) {
    let session = this.getSession(sender.key);

    if (session == undefined) {
      throw new CustomError("Sessão informada é inválida",0);
    } else if (session.getCreator() != sender) {
      throw new CustomError("Usuário não possui acesso a esta funcionalidade",0);
    } else {
      this.getSession(sender.key)?.setState(state);
    }
  }

  private deleteClient(sender: Client, cli: string) {
    let cli_obj = this.getClientByLogin(sender.key, cli);

    if (cli_obj != undefined && cli_obj != null) {
      if (sender != this.getSession(sender.key)?.getCreator()) {
        this.getSession(sender.key)?.deleteClient(cli_obj);
      } else {
        throw new CustomError("Usuário não possui permissão para a ação");
      }
    } else {
      throw new CustomError("Usuário selecionado não encontrado na sessão");
    }
  }

  private lockSession(sender: Client) {
    let session = this.getSession(sender.key);

    if (session == undefined) {
      throw new CustomError("Sessão informada é inválida");
    } else if (session.getCreator() != sender) {
      throw new CustomError("Usuário não possui acesso a esta funcionalidade");
    } else {
      this.getSession(sender.key)?.deleteClients(sender);
      this.getSession(sender.key)?.setState(SESSION.CLOSED);
    }
  }

  private closeSession(sender: Client) {
    this.getSession(sender.key)?.deleteClients();
  }

  private returnSessions(cli: Client) {
    const note = new NotificationSession(
      cli,
      new Note(
        STATUS.OK,
        TYPE.OK,
        JSON.stringify({
          action: "returnSessions",
          content: DelpSessions.getInstance().getSession(cli.key)?.toJSON(),
        }),
        "Sucesso"
      )
    );
    NotificationService.getInstance().addNotification(note);
  }

  private returnClients(cli: Client) {
    const note = new NotificationSession(
      cli,
      new Note(
        STATUS.OK,
        TYPE.OK,
        JSON.stringify({
          action: "returnClients",
          content: DelpSessions.getInstance()
            .getSession(cli.key)
            ?.getClients()
            .toJSON(),
        }),
        "Sucesso"
      )
    );
    NotificationService.getInstance().addNotification(note);
  }
}
