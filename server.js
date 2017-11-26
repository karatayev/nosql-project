#!/usr/bin/env node


const config = require('./config')
const auth = require('./auth')

// tls private keys and certs
const fs = require('fs');
const https = require('https');
const privateKey  = fs.readFileSync(config.TLS_PRIVATE_KEY, 'utf8');
const certificate = fs.readFileSync(config.TLS_CERTIFICATE, 'utf8');
const keys = {key: privateKey, cert: certificate};






const cookieParser = require('cookie-parser')
const http = require('http'), url = require('url');
const express = require('express');
const app = express();

// body-parser middleware
const bodyParser = require('body-parser')
app.use(bodyParser.json({ extended: true }));
app.use(bodyParser.urlencoded({ extended: true }));

app.use(express.static('public'));
app.use(cookieParser());


app.get('/auth-check', (req, res) => {
    let token = req.cookies['token'];

    auth.authenticated(token, (username) => {
      res.send("Yeah! You're authenticated!");
    }, (err) => {
      res.send("Sorry mois, token not found :(");
    });

});

app.post('/login', (req, res) => {
  var username = req.body.username;
  var password = req.body.password;

  auth.login(username, password, (token) => {
      auth.sessions[token] = username;

      res.cookie('token', token, { httpOnly: true, secure: true });
      res.send("OK, check with /auth-check");
  }, (err) => {
      res.send("Not OK");
  });
});

app.post('/logout', (req, res) => {
    res.send('Hello World!');
    // TODO delete token
});


var server = https.createServer(keys, app);

server.listen(config.SERVER_PORT, () => {
    console.log('[server] bookstore listening...');
});
