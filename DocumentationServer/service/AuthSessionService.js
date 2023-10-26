'use strict';


/**
 * init a session
 * init or enter in a session 
 *
 * key String 
 * returns MessageAuth
 **/
exports.initSession = function(key) {
  return new Promise(function(resolve, reject) {
    var examples = {};
    examples['application/json'] = {
  "sender" : {
    "login" : "Servidor",
    "name" : "DelpSessions",
    "key" : ""
  },
  "body" : {
    "type" : 201,
    "message" : {
      "action" : "autenticate",
      "content" : "Autenticado com sucesso"
    },
    "title" : "Sucesso"
  },
  "status" : 200
};
    if (Object.keys(examples).length > 0) {
      resolve(examples[Object.keys(examples)[0]]);
    } else {
      resolve();
    }
  });
}


/**
 * send a message in session
 * send a message to all members of the session 
 *
 * type BigDecimal 
 * title String 
 * message String 
 * status BigDecimal 
 * action String 
 * no response value expected for this operation
 **/
exports.notifySession = function(type,title,message,status,action) {
  return new Promise(function(resolve, reject) {
    resolve();
  });
}

