#!/usr/bin/env node
'use strict';

const config = require('./config')
const search = require('./search')
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

app.get('/search', (req, res) => {
    let token = req.cookies['token'];

    console.log("/search called");

    auth.authenticated(token, (username) => {
      // TODO facette search here
      search.search(req.body.title, req.body.price_min, req.body.price_max).then((data) => {
        let search_hits = [];

        data.hits.hits.forEach(function(hit) {
            //console.log(hit._source.title);
            search_hits.push({book: hit._source, score: hit._score});
        });

        res.send({
          hits: search_hits,
          aggs: data.aggregations
        });
      }).catch(() => {
        // foo
      });
    }, (err) => {
      res.send("Sorry mois, token not found :(");
    });

});

app.get('/favorites', (req, res) => {
    let token = req.cookies['token'];

    console.log("/favorites called");

    auth.authenticated(token, (username) => {
      // get favorites from sqlite
    }, (err) => {
      res.send("Sorry mois, token not found :(");
    });
});


app.delete('/favorites', (req, res) => {
    let token = req.cookies['token'];

    console.log("/favorites called");

    auth.authenticated(token, (username) => {
      // get favorites from sqlite
    }, (err) => {
      res.send("Sorry mois, token not found :(");
    });
});

// TODO post or put
app.post('/favorites', (req, res) => {
    let token = req.cookies['token'];

    console.log("/favorites called");

    auth.authenticated(token, (username) => {
      // get favorites from sqlite
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
