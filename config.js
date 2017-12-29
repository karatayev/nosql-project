#!/usr/bin/env node
/** @module config */
'use strict';

require('dotenv').config();

/** TLS files */
exports.TLS_PRIVATE_KEY = 'tls/bookstore.key';
exports.TLS_CERTIFICATE = 'tls/bookstore.crt';

/** server configuration */
exports.SERVER_HOSTNAME = '127.0.0.1';
exports.SERVER_PORT = 1337;

/** Google Books API Key */
exports.GOOGLE_BOOKS_API_KEY = process.env.GOOGLE_BOOKS_API_KEY;

/** databases locations */
exports.DATABASE_LOGIN = 'db/access.db';
exports.DATABASE_FAVORITES = 'db/favs.db';
exports.DATABASE_BOOKS = {
    host: '127.0.0.1',
    port: '9002'
};

/** Database data structure */
exports.ELASTIC_INDEX = 'bookstore';
exports.ELASTIC_TYPE = 'books';

console.log('[config] loaded');
