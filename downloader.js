'use strict';
/**
 * @description: stock downloader server with restful API
 * @author: Nicky
 */
const config = require('./ip-config');
const RestClient = require('./rest-client');
const Debug = require('./debug.js');
const ip = config.ip;
const port = config.port;

const express = require('express');
const bodyParser = require('body-parser');
// main
const app = express();
app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());
// set all response for CORS
app.all('/*', (req, res, next) => {
  res.header('Access-Control-Allow-Methods', 'GET, PUT, POST, DELETE');
  res.header('Access-Control-Allow-Headers', 'Content-Type, x-user-token');
  res.header('Access-Control-Allow-Origin', '*');
  if (req.method === 'OPTIONS') res.sendStatus(200);
  else next();
});
const router = express.Router();
const restClient = new RestClient();

function downloadData(year, month, endY, endM, stockNo, result, res) {
  if (month === endM + 1 && year === endY ||
      endM === 12 && year === endY + 1) {
    Debug.success(['Download complete!']);
    let csvFile = '日期,收盤價\n';
    for (let d of result)
      csvFile += `${d[0]},${d[1]}\n`;
    res.setHeader('Content-disposition', `attachment; filename=${stockNo}.csv`);
    res.set('Content-Type', 'text/csv');
    res.send(csvFile);
    processing = false;
    return;
  }
  Debug.info([`Downloading data of ${stockNo} on ${year}/${month}...`]);

  const host = 'www.twse.com.tw';
  let path = '/exchangeReport/STOCK_DAY_AVG?response=json&';
  const yearStr = `${1911 + year}`;
  const monthStr = (month < 10) ? `0${month}` : `${month}`;
  //console.log(yearStr, monthStr); 
  path += `date=${yearStr}${monthStr}01&stockNo=${stockNo}`;
  restClient.get(host, 80, path, (data) => {
    if (data === 503 || data.data === null || data.data === undefined) 
      Debug.warning([`cannot get data on ${year}/${month}!`]);
    else 
      for (let i = 0; i < data.data.length - 1; i++)    
        result.push(data.data[i]);
    month++;
    if (month > 12) {
      year++;
      month = 1;
    }
    console.log('calling', year, month);
    return downloadData(year, month, endY, endM, stockNo, result, res);
  });
}
let processing = false;
router.get('/', (req, res) => {
  res.setTimeout(20 * 60 * 1000, () => {
    Debug.warning(['Request timeout!']);
  });
  console.log(processing);
  if (processing) {
    Debug.warning(['Double request!']);
    return; 
  }
  processing = true;
  let result = [];
  const startY = parseInt(req.query.startY);
  const endY = parseInt(req.query.endY);
  const startM = parseInt(req.query.startM);
  const endM = parseInt(req.query.endM);
  const stockNo = parseInt(req.query.stockNo);
  
  downloadData(startY, startM, endY, endM, stockNo, result, res);
  //res.send('welcome to shop service shop api');
});
app.use('/', router);

app.listen(port, ip);
console.log(`server starts on ${ip}:${port}`);
