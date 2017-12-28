#!/usr/bin/env node
'use strict';

const config = require('./config')
const search = require('./search')
const auth = require('./auth')
const favs = require('./favs')

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
      search.search(req.query.title, req.query.price_min, req.query.price_max, req.query.published_date, req.query.authors, req.query.format, req.query.delivery_option, req.query.categories).then((data) => {
        let search_hits = [];

        data.hits.hits.forEach(function(hit) {
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
      favs.get(username).then((favorites) => {
        res.send(favorites);
      });

    }, (err) => {
      res.send("Sorry mois, token not found :(");
    });
});

// TODO
app.delete('/favorites', (req, res) => {
    let token = req.cookies['token'];

    console.log("/favorites called");

    auth.authenticated(token, (username) => {
        favs.delete(username, req.body.bookID);
    }, (err) => {
      res.send("Sorry mois, token not found :(");
    });
});

// TODO post or put
app.post('/favorites', (req, res) => {
    let token = req.cookies['token'];

    console.log("/favorites called");

    auth.authenticated(token, (username) => {
        favs.add(username, req.body.bookID);
    }, (err) => {
      res.send("Sorry mois, token not found :(");
    });
});

app.post('/login', (req, res) => {
  let username = req.body.username;
  let password = req.body.password;

  auth.login(username, password, (token) => {
      auth.register_session(token, username);

      res.cookie('token', token, { httpOnly: true, secure: true });
      res.send("OK, check with /auth-check");
  }, (err) => {
      res.send("Not OK");
  });
});

app.post('/logout', (req, res) => {
    auth.authenticated(token, (username) => {
      auth.logout(token);
    }, (err) => {
      res.send("Sorry mois, token not found :(");
    });
});


let server = https.createServer(keys, app);

server.listen(config.SERVER_PORT, () => {
    console.log('[server] bookstore listening...');
});
