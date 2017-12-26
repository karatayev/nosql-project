## Directory structure

`tls/` self signed key and crt files used for https
`public/` static html pages
`access.db` sqlite database with login credentials


## Starting

`npm start`

`npm run scrape` starts the book data scraper
It is possible that you need a Google Books API Key for acquiring many books. To
get an API key look at https://developers.google.com/books/docs/v1/using and search
for the headline "Acquiring and using an API key". Add the key to your .env file.


## ElasticSearch naming
Index: `bookstore`
Type: `books`

Book attributes:
`title`, `authors`, `publishedDate`, `price`, `categories`, `format`, `image`


## Create mapping

PUT bookstore
{
  "mappings": {
    "books": {
      "properties": {
        "title":    { "type": "text"  },
        "authors":  { "type": "keyword"  },
        "publishedDate":      { "type": "keyword" },
        "price": {"type": "integer"},
        "categories": { "type": "text"},
        "format": {"type": "keyword"},
        "image": {"type": "text"}
      }
    }
  }
}


GET bookstore/_search
{
 "query": {
    "bool" : {
      "should": {
        "match": {
          "title": "the"
        }
      },
      "must": {
        "range": {
          "price": {
          "gte" : 17,
          "lte" : 36
      }
    }
      }
    }
  },
  "aggs": {
    "formats": {
      "terms": {
         "field": "format"
       }
    },
    "prices": {
      "terms": {
         "field": "price"
       }
    },
    "authors": {
      "terms": {
         "field": "authors"
       }
    }
  }
}
