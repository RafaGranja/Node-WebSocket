export function validaValor(valor: any): boolean {
  if (
    valor == undefined ||
    valor == null ||
    valor?.length == 0 ||
    valor == "" ||
    valor == "null" ||
    valor == "undefined"
  ) {
    return false;
  }

  return true;
}
