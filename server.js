#!/usr/bin/env node
/** @module server */
'use strict';

const config = require('./config');
const search = require('./search');
const auth = require('./auth');
const favs = require('./favs');

// tls private keys and certs
const fs = require('fs');
const https = require('https');
const privateKey = fs.readFileSync(config.TLS_PRIVATE_KEY, 'utf8');
const certificate = fs.readFileSync(config.TLS_CERTIFICATE, 'utf8');
const keys = {key: privateKey, cert: certificate};

const cookieParser = require('cookie-parser');
const express = require('express');
const app = express();

// body-parser middleware
const bodyParser = require('body-parser');
app.use(bodyParser.json({ extended: true }));
app.use(bodyParser.urlencoded({ extended: true }));

app.use(express.static('public'));
app.use(cookieParser());

// book search
app.get('/search', (req, res) => {
    let token = req.cookies['token'];

    auth.authenticated(token).then((username) => {
        search.search(req.query.title, req.query.price_min, req.query.price_max, req.query.published_date, req.query.authors, req.query.format, req.query.delivery_option, req.query.categories).then((data) => {
            let searchHits = [];

            data.hits.hits.forEach(function (hit) {
                searchHits.push({book: hit._source, score: hit._score});
            });

            res.send({
                hits: searchHits,
                aggs: data.aggregations
            });
        }).catch((err) => { res.send(err); });
    }).catch((err) => { res.send(err); });
});

app.get('/favorites', (req, res) => {
    let token = req.cookies['token'];

    auth.authenticated(token).then((username) => {
        favs.get(username).then((favorites) => {
            res.send(favorites);
        });
    }).catch((err) => { res.send(err, 'Sorry mois, token not found :('); });
});

// TODO
app.delete('/favorites', (req, res) => {
    let token = req.cookies['token'];

    auth.authenticated(token).then((username) => {
        favs.delete(username, req.body.bookID);
    }).catch((err) => {
        res.send(err);
    });
});

// TODO post or put
app.post('/favorites', (req, res) => {
    let token = req.cookies['token'];

    auth.authenticated(token).then((username) => {
        favs.add(username, req.body.bookID);
    }).catch((err) => { res.send(err); });
});

app.post('/login', (req, res) => {
    let username = req.body.username;
    let password = req.body.password;

    auth.login(username, password).then((token) => {
        auth.register_session(token, username);

        res.cookie('token', token, { httpOnly: true, secure: true });
        res.send('OK, check with /auth-check');
    }).catch((err) => { res.send(err); });
});

app.post('/logout', (req, res) => {
    let token = req.cookies['token'];

    auth.authenticated(token).then((username) => {
        auth.logout(token);
    }).catch((err) => { res.send(err); });
});

// create the https server
let server = https.createServer(keys, app);

// start the https server
server.listen(config.SERVER_PORT, () => {
    console.log('[server] bookstore listening...');
});
