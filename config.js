#!/usr/bin/env node
'use strict';

require('dotenv').config();

// TLS files
exports.TLS_PRIVATE_KEY = 'tls/bookstore.key';
exports.TLS_CERTIFICATE = 'tls/bookstore.crt';

// server configuration
exports.SERVER_HOSTNAME = '127.0.0.1';
exports.SERVER_PORT = 1337;

// Google Books API Key
exports.GOOGLE_BOOKS_API_KEY = process.env.GOOGLE_BOOKS_API_KEY;

// Database data destination
exports.ELASTIC_INDEX = 'bookstore';
exports.ELASTIC_TYPE = 'books';

console.log('[config] loaded');
