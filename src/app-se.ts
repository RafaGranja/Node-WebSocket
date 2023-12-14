import { DelpSession } from "../class/Session/session";
import { Client, Clients, DefaultClient } from "../class/Client/clients";
import { DelpSessions } from "../class/Session/controlSessions";
import { Note, NotificationSession } from "../class/Notification/notification";
import { SESSION, STATUS, TYPE } from "../class/Consts/consts";
import { NotificationService } from "../class/Notification/notificationService";
import { onClose, onError, onMessage } from "./app-ws";
import { CustomError } from "../class/Error/customError";

function initSession(key: string, cli?: Client): Boolean {
  if (key == undefined || key == null || key == "") {
    throw Error("key informada não é válida");
  }
  if (cli == undefined || cli == null) {
    throw Error("Client informado não é válido");
  } else {
    cli.ws.removeAllListeners();

    cli = new Client(cli.ws, cli.login, cli.name, key,cli.spectate.toString());

    if (DelpSessions.getInstance().hasSession(key)) {
      if (
        DelpSessions.getInstance().getSession(key)?.getState() == SESSION.CLOSED && !cli.spectate
      ) {
        throw new CustomError("Sessão está fechada para entrada de novos usuários",1);
      } else {
        DelpSessions.getInstance().addClient(cli);
      }
    } else {
      const new_session: DelpSession = new DelpSession(key, cli);
      DelpSessions.getInstance().addSession(new_session, key);
      DelpSessions.getInstance().addClient(cli);
    }
  }

  return true;
}

function NotifySession(
  key: string,
  sender: Client = DefaultClient,
  action: string,
  type?: string,
  title?: string,
  message?: string,
  status?: number
) {
  DelpSessions.getInstance()
    .getSession(key)
    ?.notifyAll(
      sender,
      new Note(
        status,
        type,
        JSON.stringify({ content: message, action: action }),
        title
      )
    );
}

function autenticate(ws: any, login: string, name: string,spectate : string) {
  ws.removeAllListeners();

  ws.on("message", (data: any) => onMessage(cli, data));
  ws.on("error", (error: any) => onError(cli, error));
  ws.on("close", (ws: any) => onClose(cli));

  let cli: Client = new Client(ws, login, name,'',spectate);

  Clients.getInstance().addClient(ws, cli);
  const note = new NotificationSession(
    cli,
    new Note(
      STATUS.OK,
      TYPE.INFO,
      JSON.stringify({
        content: `Autenticado com sucesso`,
        action: "autenticate",
      }),
      "Sucesso"
    )
  );
  NotificationService.getInstance().addNotification(note);
}

export { initSession, NotifySession, autenticate };
