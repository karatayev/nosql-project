#!/usr/bin/env node
/** @module auth */
'use strict';

const sqlite3 = require('sqlite3').verbose();
const crypto = require('crypto');
const bcrypt = require('bcrypt');

exports.ERROR_UNAUTHENTICATED_REQUEST = 'TODO';

// open sessions, list of <token>: <username>
let sessions = {};

// open database connection
const db = new sqlite3.Database('./access.db', sqlite3.OPEN_READONLY, (err) => {
    if (err) {
        console.error(err.message);
    }
});

/** Generates a cryptographically secure token. */
var generateToken = () => {
    return crypto.randomBytes(128).toString('hex');
};

/**
 * Registers a new session.
 * @param {string} token - The user session's temporary token.
 * @param {string} username - Username associated with that token.
 */
exports.register_session = (token, username) => {
    sessions[token] = username;
};

/**
 * User login, checks credentials against sqlite database.
 * @param {string} username - The username.
 * @param {string} password - The password to be hashed.
 * @returns {Promise} Promise object which resolves if login succeeds.
 */
exports.login = (username, password) => {
    return new Promise((resolve, reject) => {
        // get the first matching row from the database
        db.get(`SELECT pwhash FROM login_creds WHERE username = ?`, [username], (err, row) => {
            bcrypt.compare(password, row.pwhash).then((res2) => {
                if (res2 === true) {
                    console.log('[Login] successfull login attempt:', username);
                    resolve(generateToken());
                } else {
                    console.log('[Login] failed login attempt:', username);
                    reject(err); // TODO
                }
            });
        });
    });
};

/**
 * User logout, invalidates the given token.
 * @param {string} token - User authorization token.
 */
exports.logout = (token) => {
    let user = sessions[token];

    if (user) {
        console.log('logout:', user);
        delete sessions[token];
    } else {
        console.log('Error: tried to logout while not being authenticated.');
    }
};

/**
 * Checks if the user associated with the given token is authenticated.
 * @param {string} token - User authorization token.
 * @returns {Promise} Promise object which resolves if token is authorized.
 */
exports.authenticated = (token) => {
    return new Promise((resolve, reject) => {
        // verify cookie token for every api call

        let user = sessions[token];

        if (user) {
            resolve(user);
        } else {
            reject(new Error('unauthorized token'));
        }
    });
};

console.log('[auth] loaded');
