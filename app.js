const express = require("express");
var SSH2Promise = require('ssh2-promise');
var { Client: PGClient } = require('pg');
const request = require('request');
const cors = require('cors');
const fs = require("fs");
const sshConfig = {
  username: 'crables',
  password: '!Data2020!',
  host: 'ssh.pythonanywhere.com',
  port: 22,
};

const app = express();
const port = process.env.PORT || 3001;
app.use(cors({
  origin: '*'
}));

app.get('/', (req, res) => res.send("Hello World!"));

app.post('/get_esi', async (req, res) => {
  const sshClient = new SSH2Promise(sshConfig);

  await sshClient.connect();

  const tunnel = await sshClient.addTunnel({ remoteAddr: 'crables-2137.postgres.pythonanywhere-services.com', remotePort: 12137 });
  const pgConfig = {
    user: 'super', // or 'william' depending on the user
    password: '!Data2020!',
    host: '127.0.0.1',
    port: tunnel.localPort,
    database: 'crables',
  };
  const pgClient = new PGClient(pgConfig);

  try {
    await pgClient.connect();
    console.log('PostgreSQL connection established.');

    const esiData = await pgClient.query('SELECT * FROM esi_table');
    const row = esiData.rows[esiData.rows.length - 1];
    const date = row.date.toISOString().slice(0, 10);
    const value = row.esi_g;

    const jsonOutput = JSON.stringify({
      date: date,
      value: value
    });

    await pgClient.end();
    console.log('PostgreSQL connection closed.');

    res.json(jsonOutput);
  } catch (e) {
    res.status(400).send(e.message);
  }
});

app.get('/esi_value', (req, res) => {
  request('https://fiscalbeat.s3.us-east-2.amazonaws.com/economic_strength/esi_value.json', function (error, response, body) {
    if (!error && response.statusCode == 200) {
      res.json(body);
    }
  })
});

app.get('/esi_values', (req, res) => {
  request('https://fiscalbeat.s3.us-east-2.amazonaws.com/economic_strength/esi_values.json', function (error, response, body) {
    if (!error && response.statusCode == 200) {
      res.json(body);
    }
  })
});

app.get('/esi_recession_likelihood', (req, res) => {
  request('https://fiscalbeat.s3.us-east-2.amazonaws.com/economic_strength/esi_recession_likelihood.json', function (error, response, body) {
    if (!error && response.statusCode == 200) {
      res.json(body);
    }
  })
});

app.get('/esi_recession_likelihood_historical', (req, res) => {
  request('https://fiscalbeat.s3.us-east-2.amazonaws.com/economic_strength/esi_recession_likelihood_historical.json', function (error, response, body) {
    if (!error && response.statusCode == 200) {
      res.json(body);
    }
  })
});

app.get('/csi_data_chart_1', (req, res) => {
  request('https://fiscalbeat.s3.us-east-2.amazonaws.com/cyclical_strength/csi_data_chart_1.json', function (error, response, body) {
    if (!error && response.statusCode == 200) {
      res.json(body);
    }
  })
});

app.get('/historical_performance_chart_2', (req, res) => {
  request('https://fiscalbeat.s3.us-east-2.amazonaws.com/cyclical_strength/historical_performance_chart_2.json', function (error, response, body) {
    if (!error && response.statusCode == 200) {
      res.json(body);
    }
  })
});

app.get('/risk_adjusted_returns_chart_3', (req, res) => {
  request('https://fiscalbeat.s3.us-east-2.amazonaws.com/cyclical_strength/risk_adjusted_returns_chart_3.json', function (error, response, body) {
    if (!error && response.statusCode == 200) {
      res.json(body);
    }
  })
});

app.get('/distributions_chart_4', (req, res) => {
  request('https://fiscalbeat.s3.us-east-2.amazonaws.com/cyclical_strength/distributions_chart_4.json', function (error, response, body) {
    if (!error && response.statusCode == 200) {
      res.json(body);
    }
  })
});

app.listen(port, () => console.log(`Economic backend listening on port ${port}!`));


