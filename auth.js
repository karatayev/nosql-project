#!/usr/bin/env node

const sqlite3 = require('sqlite3').verbose();
const crypto = require('crypto');
const bcrypt = require('bcrypt');
const saltRounds = 12;

// open sessions, list of <token>: <username>
exports.sessions = {};



// open database connection
const db = new sqlite3.Database('./access.db', sqlite3.OPEN_READWRITE, (err) => {
  if (err) {
    console.error(err.message);
  }
});

// secure random token creation
generate_token = () => {
    return(crypto.randomBytes(128).toString('hex'));
};



exports.login = (username, password, callback_success, callback_failure) => {
  db.get(`SELECT pwhash FROM login_creds WHERE username = ?`, [username], (err, row) => {
      bcrypt.compare(password, row.pwhash).then(function(res2) {
        if (res2 == true) {
          console.log("[Login] successfull login attempt:", username)
          callback_success(generate_token());
          // TODO forward visitor to main page
        }
        else {
          console.log("[Login] failed login attempt:", username)
          callback_failure(err);
        }
      });
  });
};

exports.logout = (token) => {
    console.log("foo");
    // TODO
};

exports.authenticated = (token, callback_success, callback_failure) => {
    // verify cookie token for every api call

    let user = exports.sessions[token];

    if (user) {
      callback_success(user);
    }
    else {
      callback_failure("Token not found")
    }

};

console.log("[auth] loaded")
