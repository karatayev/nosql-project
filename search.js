#!/usr/bin/env node
'use strict';

const config = require('./config');

let elasticsearch = require('elasticsearch');

let client = new elasticsearch.Client({
    host: 'localhost:9200',
    log: 'error'
});

exports.search = (queryTitle, priceMin, priceMax, publishedDate, authors, format, deliveryOption, categories) => {
    let searchTemplate = {
        index: config.ELASTIC_INDEX,
        type: config.ELASTIC_TYPE,
        body: {
            query: {
                bool: {
                    should: [],
                    must: []
                }
            },
            aggs: {
                formats: {
                    terms: {
                        field: 'format'
                    }
                },
                prices: {
                    terms: {
                        field: 'price'
                    }
                },
                authors: {
                    terms: {
                        field: 'authors'
                    }
                }
            }
        }
    };

    if (typeof queryTitle !== 'undefined') {
        searchTemplate.body.query.bool.should.push({match: {title: queryTitle}});
    } else {
        searchTemplate.body.query.bool.should.push({match_all: {}});
    }

    // if prices are availabe, set them
    if (typeof priceMin !== 'undefined' && typeof priceMax !== 'undefined') {
        searchTemplate.body.query.bool.must.push({range: {price: {
            gte: parseInt(priceMin, 10),
            lte: parseInt(priceMax, 10)
        }
        }
        });
    }

    // published date (term exact match)
    if (typeof publishedDate !== 'undefined') {
        searchTemplate.body.query.bool.must.push({term: {
            publishedDate: publishedDate
        }
        });
    } else {
    // TODO
    }

    // book format
    if (typeof format !== 'undefined') {
        searchTemplate.body.query.bool.must.push({term: {
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
        let authorsList = authors.split(',');

        authorsList.forEach((author) => {
            searchTemplate.body.query.bool.must.push({term: {
                authors: author
            }
            });
        });
    } else {
    // TODO
    }

    // categories
    if (typeof categories !== 'undefined') {
    // split the list
        let categoriesList = categories.split(',');
        console.log(categoriesList);

        searchTemplate.body.query.bool.must.push({terms: {
            categories: categoriesList
        }
        });
    } else {
    // TODO
    }

    return (client.search(searchTemplate));
};
