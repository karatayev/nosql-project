const config = require('../config');

const XMLHttpRequest = require('xmlhttprequest').XMLHttpRequest;
const fs = require('fs');
const elasticsearch = require('elasticsearch');
const client = new elasticsearch.Client({
    host: 'localhost:9200',
    log: 'trace'
});

// Query configuration
const basicUrl = 'https://www.googleapis.com/books/v1/volumes';
const urlbasicQueryWithCategory = '?q=subject:'; // every query has to begin with 'q='
const categories = ['horror', 'adventure', 'action', 'fiction', 'fantasy', 'mystery', 'thriller', 'science', 'technology', 'computers', 'internet', 'politics', 'history', 'romance', 'sports'];
const maxResults = '&maxResults=40'; // up to 40 are allowed
const startIndex = '&startIndex=0'; // if more than 40 books are needed, set startIndex to 40, 80, ...
// Const languageRestriction = '&langRestrict=de';  //for use insert at the end of createUrlList() push

// Repeating entries for lifelike distribution
const formats = ['Audiobook', 'Audiobook', 'Paperback', 'Paperback', 'Paperback', 'Paperback', 'Paperback', 'Hardcover', 'Hardcover', 'Hardcover'];
const deliveryoptions = ['Super Fast', 'Super Fast', 'Fast', 'Fast', 'Fast', 'Fast', 'Normal', 'Normal', 'Normal', 'Normal'];

// Database data destination
const elasticIndex = config.ELASTIC_INDEX;
const elasticType = config.ELASTIC_TYPE;

// Output file configuration
const outputDataFolder = './scraper/data/';
const outputFileName = 'bookdata';
const outputFormat = '.json';

var urlList = [];
var promises = [];
var booksOfAllCategories = [];

// Create array of query URLs
function createUrlList (categories) {
    var urlList = [];

    for (i = 0; i < categories.length; i++) {
        urlList.push(basicUrl + urlbasicQueryWithCategory + categories[i] + maxResults + startIndex + '&key=' + config.GOOGLE_BOOKS_API_KEY);
    }

    return urlList;
}

// Get data from google book API
function httpGet (url) {
    return new Promise(function (resolve, reject) {
        var request = new XMLHttpRequest();

        request.open('GET', url);
        request.onload = function () {
            if (request.status == 200) {
                resolve(request.responseText);
            } else {
                reject(Error(request));
            }
        };
        request.onerror = function () {
            reject(Error('Network error'));
        };
        request.send();
    });
}

function getRandomNumber (min, max, decimal) {
    return (Math.random() * (max - min) + min).toFixed(decimal);
}

function getRandomDelivery () {
    return deliveryoptions[getRandomNumber(0, deliveryoptions.length - 1, 0)];
}

function getRandomFormat () {
    return formats[getRandomNumber(0, formats.length - 1, 0)];
}

function getCategoryOutOfUrl (url) {
    var regex = /subject:(\w*)/g;
    var subject = regex.exec(url)[1];

    return subject.charAt(0).toUpperCase() + subject.slice(1);
}

function writeJsonToFile (data) {
    if (!fs.existsSync(outputDataFolder)) {
        fs.mkdirSync(outputDataFolder);
    }

    if (data) {
        fs.writeFile(outputDataFolder + outputFileName + outputFormat, JSON.stringify(data), function (err) {
            if (err) {
                return console.log(err);
            }
        });
    }
}

function getDataForBulkImport (books) {
    var bulkString = '';
    var bulkIndex = '{"index":{"_index":"' + elasticIndex + '", "_type":"' + elasticType + '"}}\n'; // Has to be before each dataset

    books.forEach(book => {
        bulkString = bulkString.concat(bulkIndex, JSON.stringify(book) + '\n');
    });

    return bulkString;
}

function writeJsonToDatabase (books) {
    client.bulk({
        body: [getDataForBulkImport(books)]
    }, function (err, res) {
        if (err) {
            console.log(err);
        }
    });
}

function start () {
    urlList = createUrlList(categories);

    urlList.forEach(url => {
        promises.push(httpGet(url)
            .then((booksAsText) => {
                return JSON.parse(booksAsText);
            })
            .then((booksAsJson) => {
                return booksAsJson.items;
            })
            .then((booksArray) => {
                return booksArray.forEach(book => booksOfAllCategories
                    .push({
                        'title': book.volumeInfo.title,
                        'authors': book.volumeInfo.authors ? book.volumeInfo.authors : ['Max Mustermann'],
                        'publishedDate': book.volumeInfo.publishedDate ? book.volumeInfo.publishedDate : getRandomNumber(1960, 2017, 0) + '-' + getRandomNumber(1, 12, 0) + '-' + getRandomNumber(1, 29, 0),
                        'price': (book.saleInfo.listPrice && book.saleInfo.listPrice.amount) ? book.saleInfo.listPrice.amount : parseInt(getRandomNumber(10, 60, 2)),
                        'deliveryoption': getRandomDelivery(),
                        'categories': book.volumeInfo.categories ? book.volumeInfo.categories : [getCategoryOutOfUrl(url)],
                        'format': getRandomFormat(),
                        'image': (book.volumeInfo.imageLinks && book.volumeInfo.imageLinks.thumbnail) ? book.volumeInfo.imageLinks.thumbnail : ''
                    }));
            })
        );
    });

    Promise.all(promises).then(() => {
        // Save the requested data into the database
        writeJsonToDatabase(booksOfAllCategories);

        // Save the requested data into a file (ONLY BACKUP SOLUTION)
        // writeJsonToFile(booksOfAllCategories);
        // console.log(booksOfAllCategories);
        // console.log("DONE - " + booksOfAllCategories.length + " books were written to "
        //     + outputDataFolder + outputFileName + outputFormat);
    });
}

start();
