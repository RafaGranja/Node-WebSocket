'use strict';

var utils = require('../utils/writer.js');
var AuthSession = require('../service/AuthSessionService');

module.exports.initSession = function initSession (req, res, next, key) {
  AuthSession.initSession(key)
    .then(function (response) {
      utils.writeJson(res, response);
    })
    .catch(function (response) {
      utils.writeJson(res, response);
    });
};

module.exports.notifySession = function notifySession (req, res, next, type, title, message, status, action) {
  AuthSession.notifySession(type, title, message, status, action)
    .then(function (response) {
      utils.writeJson(res, response);
    })
    .catch(function (response) {
      utils.writeJson(res, response);
    });
};
