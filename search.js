#!/usr/bin/env node
'use strict';

const config = require('./config');

var elasticsearch = require('elasticsearch');

var client = new elasticsearch.Client({
  host: 'localhost:9200',
  log: 'error'
});

exports.search = (query_title, price_min, price_max, published_date, authors, format, delivery_option, categories) => {
    let search_template  = {
          index: config.ELASTIC_INDEX,
          type: config.ELASTIC_TYPE,
          body: {
            query: {
              bool : {
                should: [],
                must: []
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
      };

    if (typeof query_title !== 'undefined') {
      search_template.body.query.bool.should.push({match: {title: query_title}});
    } else {
      search_template.body.query.bool.should.push({match_all: {}});
    }

    // if prices are availabe, set them
    if (typeof price_min !== 'undefined' && typeof price_max !== 'undefined') {
        search_template.body.query.bool.must.push({range: {price: {
              gte : parseInt(price_min, 10),
              lte : parseInt(price_max, 10)
            }
          }
        });
    }


    // published date (term exact match)
    if (typeof published_date !== 'undefined') {
      search_template.body.query.bool.must.push({term: {
          publishedDate: published_date
        }
      });
    } else {
      // TODO
    }

    // book format
    if (typeof format !== 'undefined') {
      search_template.body.query.bool.must.push({term: {
          format: format
        }
      });
    } else {
      // TODO
    }

    // TODO delivery_option?

    // authors
    if (typeof authors !== 'undefined') {
      // split the list
      let authors_list = authors.split(",");

      authors_list.forEach(function (author) {
        search_template.body.query.bool.must.push({term: {
            authors: author
          }
        });
      })
    } else {
      // TODO
    }

    // categories
    if (typeof categories !== 'undefined') {
      // split the list
      let categories_list = categories.split(",");
      console.log(categories_list);

      search_template.body.query.bool.must.push({terms: {
          categories: categories_list
        }
      });

    } else {
      // TODO
    }

    return(client.search(search_template));
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
