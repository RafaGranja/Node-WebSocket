import { logger } from "../../src/log";
import { Client, DefaultClient } from "../Client/clients";
import { STATUS, TYPE } from "../Consts/consts";

class Note {
  public type: TYPE;
  public message: string;
  public title: string;
  public status: STATUS;

  constructor(
    status: STATUS = STATUS.OK,
    type: TYPE = TYPE.INFO,
    message: string = "Mensagem vazia",
    title: string = "Nova mensagem"
  ) {
    this.type = type;
    this.message = message;
    this.title = title;
    this.status = status;
  }

  public toJSON() {
    return { type: this.type, message: this.message, title: this.title };
  }
}

class NotificationSession {
  protected note: Note;
  protected sender: Client;
  protected destiny: Client;
  protected status: STATUS;

  //ENVIA OS DADOS NA NOTIFICAÇÃO PARA O DESTINO
  public send(): void {
    this.destiny.ws.send(
      JSON.stringify({
        status: this.status,
        body: this.note.toJSON(),
        sender: this.sender,
      })
    );
  }

  constructor(
    destiny: Client,
    note: Note = new Note(),
    sender: Client = DefaultClient
  ) {
    this.sender = sender;
    this.destiny = destiny;
    this.note = note;
    this.status = note.status;
  }
}

class NotificationError extends NotificationSession {
  constructor(destiny: Client, note: string, critical : number, sender: Client = DefaultClient) {
    super(
      destiny,
      new Note(
        STATUS.ERROR,
        TYPE.ERROR,
        JSON.stringify({ content: note, action: "error" , critical : critical}),
        "Error"
      ),
      sender
    );
  }
}

export { NotificationSession, NotificationError, Note };
