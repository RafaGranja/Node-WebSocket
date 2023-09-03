"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const WebServer = require('ws');
const app_se_1 = require("./app-se");
const clients_1 = require("../class/clients");
const consts_1 = require("../class/consts");
//METODO QUE É CHAMADO QUANDO UMA CONEXÃO É ENCERRADA
function onClose(ws) {
    clients_1.Clients.clients.delete(ws);
    console.log(`onClose: ${ws}`);
}
//MÉTODO CHAMADO AO OCORRER UM ERRO DE PROCESSAMENTO
function onError(ws, err) {
    console.error(`onError:${ws}, message:${err.message}`);
}
//MÉTODO UTILIZADO PARA RECEBER MENSAGENS DO CLIENT
function onMessage(ws, data) {
    console.log(`onMessage: ${data}`);
    ws.send({ status: consts_1.STATUS.WAIT, msg: `recebido e processando` });
    let jsonObject = JSON.parse(data);
    try {
        if (jsonObject.name == undefined || jsonObject.name == null || jsonObject.name == "") {
            throw Error("name informado não é válido");
        }
        else if (jsonObject.login == undefined || jsonObject.login == null || jsonObject.login == "") {
            throw Error("login informado não é válido");
        }
        else if (jsonObject.action == undefined || jsonObject.action == null || jsonObject.action == "") {
            throw Error("action informado não é válido");
        }
        else {
            switch (jsonObject.action) {
                case 0:
                    returnStatusConst(ws);
                    break;
                case 1:
                    (0, app_se_1.initSession)(jsonObject.key, ws, jsonObject.login, jsonObject.name);
                    break;
                default:
                    throw Error("action informado não é válido");
            }
        }
    }
    catch (e) {
        ws.send({ status: consts_1.STATUS.ERROR, msg: `Informações passadas estão incompletas: ${e}` });
    }
}
function returnStatusConst(ws) {
    ws.send({ status: consts_1.STATUS.OK, data: JSON.stringify(consts_1.STATUS) });
}
//MÉTODO UTILIZADO AO INICIAR CONEXÕES CLIENT-SERVER
function onConnection(ws, req) {
    ws.on('message', (data) => onMessage(ws, data));
    ws.on('error', (error) => onError(ws, error));
    ws.on('close', (ws) => onClose(ws));
    clients_1.Clients.clients.add(ws);
    console.log(`onConnection`);
}
module.exports = (server) => {
    const wss = new WebServer.Server({
        server
    });
    //
    wss.on('connection', onConnection);
    console.log(`App Web Socket Server is running!`);
    return wss;
};
