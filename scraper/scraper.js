const XMLHttpRequest = require ('xmlhttprequest').XMLHttpRequest;
const fs = require('fs');

// Query configuration
const basicUrl = 'https://www.googleapis.com/books/v1/volumes';
const urlbasicQueryWithCategory = '?q=category:';  // every query has to begin with 'q='
const categories = ["horror", "adventure", "action", "fiction", "fantasy", "mystery", "thriller", "science", "technology", "computers", "internet", "politics", "history", "romance", "sports"];
const maxResults = '&maxResults=40';  // up to 40 are allowed
const startIndex = '&startIndex=0';  // if more than 40 books are needed, set startIndex to 40

// Output file configuration
const outputDataFolder = './scraper/data/';
const outputFileName = 'bookdata';
const outputFormat = '.json';

var urlList = [];
var promises = [];
var booksOfAllCategories = [];

// Create array of query URLs
function createUrlList(categories) {
    var urlList = [];

    for(i = 0; i < categories.length; i++) {
        urlList.push(basicUrl + urlbasicQueryWithCategory + categories[i] + maxResults + startIndex);
    }

    return urlList;
}

// Get data from google book API
function httpGet(url) {

    return new Promise(function(resolve, reject) {
        var request = new XMLHttpRequest();

        request.open( "GET", url);
        request.onload = function() {
            if (request.status == 200) {
                resolve(request.responseText);
            } else {
                reject(Error(request.statusText));
            }
        };
        request.onerror = function() {
            reject(Error("Network error"));
        };
        request.send();
    });
}

// Save requested data to a file
function writeJsonToFile(data) {
    if (!fs.existsSync(outputDataFolder)){
        fs.mkdirSync(outputDataFolder);
    }

    fs.writeFile(outputDataFolder + outputFileName + outputFormat, JSON.stringify(data), function(err) {
        if(err) {
            return console.log(err);
        }
    });
}

function start() {
    urlList = createUrlList(categories);

    urlList.forEach(url => {
        promises.push(httpGet(url)
            .then((booksAsText) => {
                return JSON.parse(booksAsText);
            })
            .then((booksAsJson) => {
                return booksAsJson.items;
            })
            .then ((bookArray) => {
                return bookArray.forEach(book => booksOfAllCategories.push(book));
            })
        );
    });

    Promise.all(promises).then(() => {
        writeJsonToFile(booksOfAllCategories);
        console.log("DONE - " + booksOfAllCategories.length + " books were written to "
            + outputDataFolder + outputFileName + outputFormat);
    });
}

start();
