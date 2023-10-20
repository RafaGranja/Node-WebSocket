'use strict';

var utils = require('../utils/writer.js');
var UserSession = require('../service/UserSessionService');

module.exports.autenticate = function autenticate (req, res, next, action, login, name) {
  UserSession.autenticate(action, login, name)
    .then(function (response) {
      utils.writeJson(res, response);
    })
    .catch(function (response) {
      utils.writeJson(res, response);
    });
};

module.exports.returnConsts = function returnConsts (req, res, next, action) {
  UserSession.returnConsts(action)
    .then(function (response) {
      utils.writeJson(res, response);
    })
    .catch(function (response) {
      utils.writeJson(res, response);
    });
};
