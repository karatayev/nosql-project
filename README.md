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

`npm run linter` runs `eslint` on the project.

`npm run documentation` creates jsdoc documentation

## ElasticSearch naming
Index: `bookstore`
Type: `books`

Book attributes:
`title`, `authors`, `publishedDate`, `price`, `deliveryoption`, `categories`, `format`, `image`


## Setting up the project

1. Download and start Elasticsearch 
2. Put the following mapping (e.g. using `kibana` or `curl`):

```
PUT bookstore
{
  "mappings": {
    "books": {
      "properties": {
        "title":    { "type": "text"  },
        "authors":  { "type": "keyword"  },
        "publishedDate":      { "type": "keyword" },
        "price": {"type": "integer"},
        "categories": { "type": "keyword"},
        "format": {"type": "keyword"},
        "image": {"type": "text"}
      }
    }
  }
}
```

3. Run `npm run scrape` to import some books to Elasticsearch
4. Run `npm start` to launch bookstore
5. Visit https://127.0.0.1:1337/, login using sample credentials `tobias:password` or `florian:password`
6. Perform your searches

## Security

Authentication

* Backend calls except /login must be authenticated using a valid cookie
* Password hashes in database are protected by BCRYPT hashing algorithm

Injection

* All parameters must be protected against NoSQL injection: https://ckarande.gitbooks.io/owasp-nodegoat-tutorial/content/tutorial/a1_-_sql_and_nosql_injection.html
* Login and favs must be protected against SQL injection