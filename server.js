#!/usr/bin/env node

const http = require('http'), url = require('url');
const redis = require('redis');
const client = redis.createClient();

const hostname = '127.0.0.1';
const port = 1337;

const server = http.createServer((req, res) => {
	res.statusCode = 200;
	res.setHeader('Content-Type', 'text/plain');
	res.end('Blaaah!\n');

	path = url.parse(req.url).pathname
	requested_data = path.replace('/','')

	console.log("Requested data:", requested_data);
});

server.listen(port, hostname, () => {
	console.log(`Server running at http://${hostname}:${port}/`);
});
