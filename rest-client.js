"use strict";
/**
 * @description: Restful API client (JSON)
 * @author: Nicky
 */
const Debug = require('./debug');
const http = require('http');
class RestClient {
  // return an object if parsed successfully
  // otherwise, it will print raw reponse and return status code
  _makeRequest(option, dataStr, callback) {
    let req = http.request(option, (res) => {
      let result = '';
      res.on('data', (data) => {
        result += data;
      });
      res.on('end', () => {
        try {
          const obj = JSON.parse(result);
          callback(obj);
        }
        catch (err) {
          console.log(err);
          Debug.warning(['RestClient', 'Parse JSON failed', 'raw response is printed']);
          Debug.warning(['Raw response', result]);
          callback(res.statusCode);
        }
      });
    });
    if (dataStr.length > 0) req.write(dataStr);
    req.end();
  }
  get(host, port, path, callback) {
    const option = {
      host: host,
      port: port,
      path: path,
      headers: {
        'Content-Type': RestClient.contentType,
        'Content-Length': 0
      },
      method: 'GET'
    };
    this._makeRequest(option, '', callback);
  }
  put(host, port, path, data, callback) {
    let dataStr = JSON.stringify(data);
    const option = {
      host: host,
      port: port,
      path: path,
      headers: {
        'Content-Type': RestClient.contentType,
        'Content-Length': dataStr.length
      },
      method: 'PUT'
    }
    this._makeRequest(option, dataStr, callback);
  }
  post(host, port, path, data, callback) {
    let dataStr = JSON.stringify(data);
    const option = {
      host: host,
      port: port,
      path: path,
      headers: {
        'Content-Type': RestClient.contentType,
        'Content-Length': dataStr.length
      },
      method: 'POST'
    }
    this._makeRequest(option, dataStr, callback);
  }
  getWToken(host, port, path, token, callback) {
    const option = {
      host: host,
      port: port,
      path: path,
      headers: {
        'Content-Type': RestClient.contentType,
        'Content-Length': 0,
        'x-user-token': token
      },
      method: 'GET'
    };
    this._makeRequest(option, '', callback);
  }
  constructor() {
  }
}
RestClient.contentType = 'application/json';
module.exports = RestClient;
