## Command overview

`npm start` to launch bookstore

`npm run scraper` starts the book data scraper

Google Books API Key is required for acquiring many books. To
get an API key look at https://developers.google.com/books/docs/v1/using and search
for the headline "Acquiring and using an API key". Add the key to your .env file.

`npm run linter` runs `eslint` on the project

`npm run documentation` creates jsdoc documentation in seperate documentation folder


## Installation

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

3. Run `npm install` to install node modules
4. Copy `.env.example` and save as `.env` in the main directory. Then add your Google Books API key
5. Run `npm run scraper` to import some books to Elasticsearch
6. Run `npm start` to launch bookstore
7. Visit https://127.0.0.1:1337/, login using sample credentials `tobias:password` or `florian:password`
8. Perform your searches


## Directory structure and source code overview

`db/`: contains sqlite databases (`access.db`: login credentials, `favs.db`: book favorites)

`documentation/` after running `npm run documentation`, the jsdoc files are placed here

`public/` contains images, scripts and stylesheets for the frontend

`scraper/` after running `npm run scraper`, sample books are inserted into the ES DB

`tls/` self signed key and crt files used for https


## ElasticSearch naming
Index: `bookstore`
Type: `books`

Book attributes:
`title`, `authors`, `publishedDate`, `price`, `deliveryoption`, `categories`, `format`, `image`


## Providing basic security

Authentication

* Backend calls except `/login` must be authenticated using a valid cookie token
* Password hashes in database are protected by BCRYPT hashing algorithm

Injection prevention

* All parameters are protected against NoSQL injection using type checks https://ckarande.gitbooks.io/owasp-nodegoat-tutorial/content/tutorial/a1_-_sql_and_nosql_injection.html. Furthermore, only values are allowed which match `[\w., ]+`.
* Login and favs are protected against SQL injection using prepared statements
