#!/usr/bin/env node
'use strict';

const sqlite3 = require('sqlite3').verbose();

// open database connection
const db = new sqlite3.Database('./favs.db', sqlite3.OPEN_READWRITE, (err) => {
  if (err) {
    console.error(err.message);
  }
});


exports.get = (username) => {
  return new Promise((resolve, reject) => {
    db.all(`SELECT bookID FROM favorites WHERE username = ?`, [username], (err, rows) => {
      resolve({
        name: username,
        favorites: rows
      });
    });
  });
};

exports.add = (username, bookID) => {
  db.run(`insert into favorites (username, bookID) values (?, ?);`, [username, bookID], function(err) {
    // err
  });
};

exports.delete = (username, bookID) => {
  // TODO check if bookID valid
  db.run(`DELETE FROM favorites WHERE bookID = ?`, [bookID], function(err) {
    // err
  });
};

console.log("[favs] loaded");
