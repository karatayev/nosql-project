#!/usr/bin/env node
'use strict';

const config = require('./config');

var elasticsearch = require('elasticsearch');

var client = new elasticsearch.Client({
  host: 'localhost:9200',
  log: 'error'
});

//exports.search = (query_title, price_min, price_max, published_date, authors, format, delivery_option, categories) => {
exports.search = (query_title, price_min, price_max) => {
    return(client.search({
          index: config.ELASTIC_INDEX,
          type: config.ELASTIC_TYPE,
          body: {
            query: {
              bool : {
                should: {
                  match: {
                    title: query_title
                  }
                },
                must: {
                  range: {
                    price: {
                      gte : price_min,
                      lte : price_max
                    }
                  }
                }
              }
            },
            aggs: {
              formats: {
                terms: {
                   field: "format"
                 }
              },
              prices: {
                terms: {
                   field: "price"
                 }
              },
              authors: {
                terms: {
                   field: "authors"
                 }
              }
            }
          }
      }));
};

exports.search_title = (text, success_callback, failure_callback) => {
  // WARNING: NoSQL injection
  client.search({
      index: config.ELASTIC_INDEX,
      type: config.ELASTIC_TYPE,
      body: {
        query: {
          match: {
            title: text
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
