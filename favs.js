#!/usr/bin/env node
/** @module favs */
'use strict';

const config = require('./config');
const sqlite3 = require('sqlite3').verbose();

/** database connection */
const db = new sqlite3.Database(config.DATABASE_FAVORITES, sqlite3.OPEN_READWRITE, (err) => {
    if (err) {
        console.error(err.message);
    }
});

/**
 * Obtain the user's favorite books.
 * @param {string} username - Username.
 * @returns {Promise} Promise object which if resolving, contains user name and favorite book ids.
 */
exports.get = (username) => {
    return new Promise((resolve, reject) => {
        db.all(`SELECT bookID FROM favorites WHERE username = ?;`, [username], (err, rows) => {
            if (err) {
                reject(err);
            }

            resolve({
                name: username,
                favorites: rows
            });
        });
    });
};

/**
 * Add a user's favorite book.
 * @param {string} username - Username.
 * @param {string} bookID - Book id (from elasticsearch).
 * @returns {Promise} Promise object resolving if no error occured.
 */
exports.add = (username, bookID) => {
    return new Promise((resolve, reject) => {
        db.run(`insert into favorites (username, bookID) values (?, ?);`, [username, bookID], (err) => {
            if (err) {
                reject(err);
            } else {
                resolve();
            }
        });
    });
};

/**
 * Delete one of a user's favorite book.
 * @param {string} username - Username.
 * @param {string} bookID - Book id (from elasticsearch).
 * @returns {Promise} Promise object resolving if no error occured.
 */
exports.delete = (username, bookID) => {
    return new Promise((resolve, reject) => {
        // TODO check if bookID valid
        db.run(`DELETE FROM favorites WHERE bookID = ?;`, [bookID], (err) => {
            if (err) {
                reject(err);
            } else {
                resolve();
            }
        });
    });
};

console.log('[favs] loaded');
