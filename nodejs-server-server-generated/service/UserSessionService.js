'use strict';


/**
 * autenticate user
 * Autenticate the connection with user login and name 
 *
 * action String 
 * login String 
 * name String 
 * returns MessageAuth
 **/
exports.autenticate = function(action,login,name) {
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
 * return consts
 * Return a object that contains the conts of the Socket messages 
 *
 * action String 
 * returns List
 **/
exports.returnConsts = function(action) {
  return new Promise(function(resolve, reject) {
    var examples = {};
    examples['application/json'] = [ {
  "sender" : {
    "login" : "Servidor",
    "name" : "DelpSessions",
    "key" : ""
  },
  "body" : {
    "type" : 201,
    "message" : {
      "action" : "returnConsts",
      "content" : {
        "status" : {
          "error" : 403,
          "wait" : 199,
          "ok" : 200
        },
        "type" : {
          "error" : 403,
          "warning" : 199,
          "ok" : 200,
          "info" : 201,
          "action" : 202
        },
        "session" : {
          "closed" : -1,
          "open" : 1
        }
      },
      "title" : "CONSTS"
    }
  },
  "status" : 200
}, {
  "sender" : {
    "login" : "Servidor",
    "name" : "DelpSessions",
    "key" : ""
  },
  "body" : {
    "type" : 201,
    "message" : {
      "action" : "returnConsts",
      "content" : {
        "status" : {
          "error" : 403,
          "wait" : 199,
          "ok" : 200
        },
        "type" : {
          "error" : 403,
          "warning" : 199,
          "ok" : 200,
          "info" : 201,
          "action" : 202
        },
        "session" : {
          "closed" : -1,
          "open" : 1
        }
      },
      "title" : "CONSTS"
    }
  },
  "status" : 200
} ];
    if (Object.keys(examples).length > 0) {
      resolve(examples[Object.keys(examples)[0]]);
    } else {
      resolve();
    }
  });
}

