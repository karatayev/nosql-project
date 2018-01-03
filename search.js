#!/usr/bin/env node
/** @module search */
'use strict';

const config = require('./config');

let elasticsearch = require('elasticsearch');

/** Elasticsearch database connection. */
let client = new elasticsearch.Client({
    host: config.DATABASE_BOOKS.host + ':' + config.DATABASE_BOOKS.port,
    log: 'error'
});

let validParameter = (str) => {
    return typeof str === 'string' && /[\w.\-, ]+/.test(str);
};

/**
 * Bookstore search using facettes.
 * @param {string} queryTitle - Book title that should match.
 * @param {string} priceMin - Minimum price that must be met.
 * @param {string} priceMax - Maximum price that must be met .
 * @param {string} publishedDate - Date or year when book was published.
 * @param {string} authors - Comma separated list of authors.
 * @param {string} format - Paperback/Hardcover/Audiobook.
 * @param {string} deliveryOption - Delivery option provided.
 * @param {string} categories - Comma separated list of categories.
 * @returns {Promise} Promise object which represents elasticsearch search.
 */
exports.search = (queryTitle, priceMin, priceMax, publishedDate, authors, format, deliveryOption, categories) => {
    let searchTemplate = {
        index: config.ELASTIC_INDEX,
        type: config.ELASTIC_TYPE,
        body: {
            from: 0,
            size: config.SEARCH_MAX_RESULT_COUNT,
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

    // title
    if (validParameter(queryTitle)) {
        searchTemplate.body.query.bool.should.push({match: {title: String(queryTitle)}});
    } else {
        searchTemplate.body.query.bool.should.push({match_all: {}});
    }

    // if prices are availabe, set them
    if (validParameter(priceMin) && validParameter(priceMax)) {
        searchTemplate.body.query.bool.must.push({range: {price: {
            gte: parseFloat(priceMin),
            lte: parseFloat(priceMax)
        }
        }
        });
    }

    // published date (term exact match)
    if (validParameter(publishedDate)) {
        searchTemplate.body.query.bool.must.push({term: {
            publishedDate: publishedDate
        }
        });
    }

    // book format
    if (validParameter(format)) {
        searchTemplate.body.query.bool.must.push({term: {
            format: format
        }
        });
    }

    // delivery option
    if (validParameter(deliveryOption)) {
        searchTemplate.body.query.bool.must.push({term: {
            deliveryoption: deliveryOption
        }
        });
    }

    // authors
    if (validParameter(authors)) {
        // split the list
        let authorsList = authors.split(',');

        searchTemplate.body.query.bool.must.push({terms: {
            authors: authorsList
        }
        });
    }

    // categories
    if (validParameter(categories)) {
    // split the list
        let categoriesList = categories.split(',');

        searchTemplate.body.query.bool.must.push({terms: {
            categories: categoriesList
        }
        });
    }

    return (client.search(searchTemplate));
};

exports.getBookByID = (bookID) => {
    if (validParameter(bookID)) {
        return (client.search({
            index: config.ELASTIC_INDEX,
            type: config.ELASTIC_TYPE,
            body: {
                query: {
                    term: {
                        _id: bookID
                    }
                }
            }
        }));
    } else {
        return new Promise((resolve, reject) => {
            reject(new Error('bookID parameter invalid'));
        });
    }
};
