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
