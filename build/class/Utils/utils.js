"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validaValor = void 0;
function validaValor(valor) {
    if (valor == undefined || valor == null || (valor === null || valor === void 0 ? void 0 : valor.length) == 0 || valor == "" || valor == "null" || valor == "undefined") {
        return false;
    }
    return true;
}
exports.validaValor = validaValor;
