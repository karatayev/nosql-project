#!/usr/bin/env node

// TLS files
exports.TLS_PRIVATE_KEY = 'tls/bookstore.key'
exports.TLS_CERTIFICATE = 'tls/bookstore.crt'

// server configuration
exports.SERVER_HOSTNAME = '127.0.0.1'
exports.SERVER_PORT = 1337

console.log("[config] loaded")
