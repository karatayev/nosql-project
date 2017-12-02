#!/usr/bin/env node

var elasticsearch = require('elasticsearch');

var client = new elasticsearch.Client({
  host: 'localhost:9200',
  log: 'trace'
});

exports.search_title = (text, success_callback, failure_callback) => {
  // WARNING: NoSQL injection
  client.search({
  index: 'university',
  //type: 'tweets',
  body: {
    query: {
      match: {
        name: text
      }
    }
  }
  }).then(function (resp) {
    success_callback(resp.hits.hits);
  }, function (err) {
    console.trace(err.message);
    failure_callback();
  });
};
