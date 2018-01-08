/** @module htmlbuilder */

/**
 * Hides and shows content depending on login status.
 * @param {string} loginName - User which is logged in.
 */
function showHideHelper (loginName) {
    $('#loginForm').hide();
    $('#loggedInAs').append('Logged in as: ' + loginName);
    $('#loggedInHeader:hidden').show();
    $('#hideOnStartup-left:hidden').show();
    getMostAuthorsInitial();
}

/**
 * Creates a checkbox list of the ten most appearing authors.
 */
function getMostAuthorsInitial () {
    // Get all DB data which includes author buckets.
    $.get('/search')
        .done(function (data) {
            $('#authorList')
                .append(
                    "<label class='author' for='authors'>Authors</label>"
                );
            // Create checkboxes and append them at the end of the filter list.
            $.each(data.aggs.authors.buckets, function (index, value) {
                $('#authorList')
                    .append(
                        "<div class='form-check'>" +
                    "<label class='form-check-label'>" +
                    "<input class='form-check-input author' type='checkbox' name='authors' value='" + value.key + "'>" +
                    value.key + "<span class='counters'> (" + value.doc_count + ') </span>' +
                    '</label>' +
                    '</div>'
                    );
            });
        });
}

/**
 * Creates a book item and add it to the results tag.
 * @param {Object} data - Dataset from one book.
 * @param {string} data.image - Books image URL.
 * @param {string} data.title - Books title.
 * @param {string} data.publishedDate - Books published date.
 * @param {Array.<string>} data.authors - Books authors.
 * @param {string} data.format - Books format.
 * @param {string} data.price - Books selling price.
 * @param {string} data.deliveryoption - Books delivery option.
 * @param {Array.<string>} data.categories - Books categories.
 * @param {string} id - Books ID.
 * @param {string} calledFrom - Called from either show favorites (showFavorites) or book results (booksearch).
 */
function appendResults (data, id, calledFrom) {
    $('#results')
        .append(
            "<div class='separator'>" +
            "<div class='resultItems favoriteResults d-flex bd-highlight mb-3'>" +
            "<div class='p-2 bd-highlight'>" +
            "<div class='resultItem image'>" + "<img src='" + data.image + "' alt='NO IMAGE'>" + '</div>' +
            '</div>' +
            "<div class='align-self-start bd-highlight'>" +
            "<div class='d-flex bd-highlight'>" +
            "<div class='resultItem title'>" + data.title + '</div>' +
            "<div class='resultItem publishedDate align-self-center'>" + data.publishedDate + '</div>' +
            '</div>' +
            "<div class='resultItem authors'>" + 'von ' + data.authors + '</div>' +
            "<div class='resultItem format'>" + data.format + '</div>' +
            "<div class='resultItem price'>" + 'EUR ' + getDecimalNumber(data.price, 2) + '</div>' +
            "<div class='resultItem deliveryoption'>" + 'Delivery Option: ' + data.deliveryoption + '</div>' +
            "<div class='resultItem categories'>" + data.categories + '</div>' +
            '</div>' +
            "<div class='p-2 bd-highlight'>" +
            "<div class='resultItem favorite'>" + "<div class='addOrDeleteFavorite " + calledFrom + "' id='" + id + "'>" + insertFavoriteImage(id) + '</div></div>' +
            '</div>' +
            '</div>' +
            '<hr>' +
            '</div>'
        );
}

/**
 * Shows right favorite image, whether it is a favorite or not.
 * @param {string} id - Books ID.
 */
function insertFavoriteImage (id) {
    var idTag = '#' + id;
    var favoritesArray = [];
    var isFavorite = false;

    // Get all favorites
    $.get('/favorites')
        .done(function (data) {
            $.each(data.favorites, function (index, value) {
                favoritesArray.push(value.bookID);
            });

            // Check if given book is a favorite
            for (var i = 0; i < favoritesArray.length; i++) {
                if (favoritesArray[i] === id) {
                    isFavorite = true;
                }
            }

            // insert right favorite image
            clearContent(idTag);
            if (isFavorite === true) {
                $(idTag).append("<img class='star' src='./images/star_yellow.png' alt='fav'>");
            } else {
                $(idTag).append("<img class='star' src='./images/star_empty.png' alt='fav'>");
            }
        });
}
/**
 * Creates info text about the what the user has entered to search books.
 * @param {Object} formData - Details for the info text.
 * @param {string} formData.title - Prints the inserted title.
 * @param {string} formData.price_min - Prints the inserted minimum price.
 * @param {string} formData.price_max - Prints the inserted maximum price.
 * @param {string} data.published_Date - Prints the inserted publish date.
 * @param {string} data.format - Prints the inserted format.
 * @param {string} data.delivery_option - Prints the inserted delivery option.
 * @param {Array.<string>} data.categories - Prints the inserted categories.
 * @param {Array.<string>} data.authors - Prints the inserted authors.
 * @returns {string} - Concatenated string of all requested data.
 */
function searchedFor (formData) {
    let searchedFor = '';

    if (formData.title) {
        if (searchedFor === '') {
            searchedFor = searchedFor.concat(formData.title);
        } else {
            searchedFor = searchedFor.concat(', ', formData.title);
        }
    }

    if (formData.price_min) {
        if (searchedFor === '') {
            searchedFor = searchedFor.concat(formData.price_min, ' to ', formData.price_max, '€');
        } else {
            searchedFor = searchedFor.concat(', ', formData.price_min, ' to ', formData.price_max, '€');
        }
    }

    if (formData.published_date) {
        if (searchedFor === '') {
            searchedFor = searchedFor.concat(formData.published_date);
        } else {
            searchedFor = searchedFor.concat(', ', formData.published_date);
        }
    }

    if (formData.format) {
        if (searchedFor === '') {
            searchedFor = searchedFor.concat(formData.format);
        } else {
            searchedFor = searchedFor.concat(', ', formData.format);
        }
    }

    if (formData.delivery_option) {
        if (searchedFor === '') {
            searchedFor = searchedFor.concat(formData.delivery_option);
        } else {
            searchedFor = searchedFor.concat(', ', formData.delivery_option);
        }
    }

    if (formData.categories) {
        if (searchedFor === '') {
            searchedFor = searchedFor.concat(formData.categories);
        } else {
            searchedFor = searchedFor.concat(', ', formData.categories);
        }
    }

    if (formData.authors) {
        if (searchedFor === '') {
            searchedFor = searchedFor.concat(formData.authors);
        } else {
            searchedFor = searchedFor.concat(', ', formData.authors);
        }
    }

    return searchedFor;
}

/**
 * Counts the number of all items within the ES buckets.
 * @param {string} data - All ES buckets for one item.
 * @returns {number} - Sum of all items
 */
function getSumOfAllItems (data) {
    let sum = 0;

    data.forEach(date => {
        sum += date.doc_count;
    });

    return sum;
}

/**
 * Counts the number of all items with a specific price.
 * @param {string} data - All ES buckets from the prices.
 * @param {string} item - String with searched min and max price included.
 * @returns {number} - Sum of all items with specific price.
 */
function getSumOfOnePrice (data, item) {
    let sum = 0;
    let minAndMaxPrice = extractPricesFromString(item);

    data.forEach(date => {
        let key = parseInt(date.key);

        if (key >= minAndMaxPrice[0] && key < minAndMaxPrice[1]) {
            sum += date.doc_count;
        }
    });

    return sum;
}

/**
 * Counts the number of all items with a specific format.
 * @param {string} data - All ES buckets from the formats.
 * @param {string} item - String with searched format included.
 * @returns {number} - Sum of all items with specific format.
 */
function getSumOfOneFormat (data, item) {
    let sum = 0;

    data.forEach(date => {
        if (item === date.key) {
            sum += date.doc_count;
        }
    });

    return sum;
}

/**
 * Get the min and max price out of an option string.
 * @param {string} optionString - String with searched min and max price included.
 * @returns {Array.<string>} - Array with min price at first and max price at second position.
 */
function extractPricesFromString (optionString) {
    var m = /(\d+)-(\d+)/.exec(optionString);

    return m ? [+m[1], +m[2]] : null;
}

/**
 * Clears the submitted html-tag and all child tags.
 * @param {string} tag - Tag which have to be cleared.
 */
function clearContent (tag) {
    $(tag).empty();
}

/**
 * Get the min or max price value out of a string.
 * @param {string} priceMinAndMaxString - String with searched min and max price.
 * @param {number} minOrMax - Whether 0 for min price or 1 for max price.
 * @returns {string} - Returns min or max price.
 */
function getMinOrMaxPriceOutOfString (priceMinAndMaxString, minOrMax) {
    return priceMinAndMaxString.split('-')[minOrMax];
}

/**
 * Create a string with comma separated option values.
 * @param {string} inputName - Name of the checkbox option.
 * @returns {string} - Comma separated list.
 */
function getCommaSeparatedList (inputName) {
    var arrayOfItems = [];
    var commaSeparatedList = '';
    var comma = ',';

    // Get each option which is checked.
    $.each($('input[name=' + inputName + ']:checked'), function () {
        arrayOfItems.push($(this).val());
    });

    // If there are checked elements, add them to a string.
    if (arrayOfItems.length >= 1) {
        arrayOfItems.forEach(item => {
            if (commaSeparatedList === '') {
                commaSeparatedList = item;
            } else {
                commaSeparatedList = commaSeparatedList.concat(comma, item);
            }
        });
    }

    return commaSeparatedList;
}

/**
 * Get a number with x decimals.
 * @param {number} value - Number with unknown number of decimals.
 * @param {number} decimal - Set number of decimals.
 * @returns {number} - Number with specified number of decimals.
 */
function getDecimalNumber (value, decimal) {
    return value.toFixed(decimal);
}

// Login
$(document).ready(function () {
    $('#loginForm').submit(function (event) {
        var formData = {
            'username': $('#username').val() || '',
            'password': $('#password').val() || ''
        };

        $.post('/login', formData)
            .done(function () {
                $.get('/favorites')
                    .done(function (data) {
                        var loginName = data.name;

                        if (loginName) {
                            $('#username').val('');
                            $('#password').val('');
                            showHideHelper(loginName);
                        }
                    });
            });
        event.preventDefault();
    });
});

// Check if user is already logged in, in case of page refresh
$(window).on('load', function () {
    $.get('/favorites')
        .done(function (data) {
            var loginName = data.name;

            if (loginName) {
                showHideHelper(loginName);
            }
        });
});

// Logout
$(document).ready(function () {
    $('#header').on('click', 'div #logoutButton', function () {
        clearContent('#results');
        $('#loggedInHeader').hide();
        $('#hideOnStartup-left').hide();
        $('#loginForm').show();
        $.get('/logout');
    });
});

// Show favorites
$(document).ready(function () {
    $('#header').on('click', 'div #showFavoritesButton', function () {
        clearContent('#results');
        clearContent('.counters');
        $.get('/favorites')
            .done(function (data) {
                if (data.favorites.length === 0) {
                    $('#results').append('<h2>You have no favorites yet</h2>');
                } else {
                    $('#results').append("<h2 id='myFavorites'>My Favorites</h2>");
                    $.each(data.favorites, function (index, value) {
                        var formData = {
                            'id': value.bookID
                        };

                        $.get('/book', formData)
                            .done(function (bookdata) {
                                appendResults(bookdata[0]._source, bookdata[0]._id, 'showFavorites');
                            });
                    });
                }
            });
    });
});

// Add or remove a favorite
$(document).ready(function () {
    $('.wrapper').on('click', '.main #results .resultItems .p-2 .favorite .addOrDeleteFavorite', function (event) {
        var favId = this.id;
        var idTag = '#' + favId;
        var formData = {'bookID': favId};
        var favoritesArray = [];
        var isFavorite = false;

        // Get all favorites
        $.get('/favorites')
            .done(function (data) {
                $.each(data.favorites, function (index, value) {
                    favoritesArray.push(value.bookID);
                });

                // Check if given book is a favorite
                for (var i = 0; i < favoritesArray.length; i++) {
                    if (favoritesArray[i] === favId) {
                        isFavorite = true;
                    }
                }

                // Delete or add from/to favorites.
                if (isFavorite === true) {
                    if ($(idTag).hasClass('showFavorites')) {
                        $(idTag).parent().parent().parent().parent().empty();
                    } else {
                        clearContent(idTag);
                        $(idTag).append("<img class='star' src='./images/star_empty.png' alt='fav'>");
                    }
                    $.ajax({
                        type: 'DELETE',
                        url: '/favorites',
                        data: formData
                    });
                } else {
                    clearContent(idTag);
                    $(idTag).append("<img class='star' src='./images/star_yellow.png' alt='fav'>");
                    $.ajax({
                        type: 'POST',
                        url: '/favorites',
                        data: formData
                    });
                }
            });
        event.preventDefault();
    });
});

// Trigger book search after 3 or more characters at the title search
$(document).ready(function () {
    $('#titlesearch').on('keyup', function () {
        if (this.value.length > 2) {
            $('#searchForm').submit();
        }
    });
});

// Trigger book search after changing price category
$(document).ready(function () {
    $('#pricecategory').on('change', function () {
        $('#searchForm').submit();
    });
});

// Trigger book search after changing delivery option
$(document).ready(function () {
    $('#deliveryoption').on('change', function () {
        $('#searchForm').submit();
    });
});

// Trigger book search after changing format
$(document).ready(function () {
    $('#format').on('change', function () {
        $('#searchForm').submit();
    });
});

// Trigger book search after changing category or author
$(document).ready(function () {
    $('.wrapper').on('change', '.search #searchForm .form-group .form-check .form-check-label .form-check-input', function () {
        $('#searchForm').submit();
    });
});

// Search books
$(document).ready(function () {
    // Submit search data
    $('#searchForm').submit(function (event) {
        var formData = {
            'title': $('#titlesearch').val(),
            'price_min': getMinOrMaxPriceOutOfString($('#pricecategory').val(), 0) || '',
            'price_max': getMinOrMaxPriceOutOfString($('#pricecategory').val(), 1) || '',
            'published_date': $('#publishedDate').val(),
            'format': $('#format').val(),
            'delivery_option': $('#deliveryoption').val(),
            'categories': getCommaSeparatedList('categories'),
            'authors': getCommaSeparatedList('authors')
        };

        var searchedForFormData = searchedFor(formData);

        // Get array of favorites to compare if book is favorite
        var favoritesArray = [];

        $.get('/favorites')
            .done(function (data) {
                $.each(data.favorites, function (index, value) {
                    favoritesArray.push(value.bookID);
                });

                // Get requested books
                $.get('/search', formData)
                    .done(function (data) {
                        clearContent('.counters');

                        // Show message if there is no conn to ES
                        if (data.message == "No Living connections") {
                            clearContent('#results');
                            $('#results')
                                .append("No living connection to DB! Please check, if ElasticSearch is up.");
                        }

                        // prices
                        $('#noPricecategoryOption').append("<div class='counters'> (" + getSumOfAllItems(data.aggs.prices.buckets, 'noPricecategoryOption') + ') </div>');
                        $('#0-10').append("<div class='counters'> (" + getSumOfOnePrice(data.aggs.prices.buckets, '0-10') + ') </div>');
                        $('#10-20').append("<div class='counters'> (" + getSumOfOnePrice(data.aggs.prices.buckets, '10-20') + ') </div>');
                        $('#20-30').append("<div class='counters'> (" + getSumOfOnePrice(data.aggs.prices.buckets, '20-30') + ') </div>');
                        $('#30-40').append("<div class='counters'> (" + getSumOfOnePrice(data.aggs.prices.buckets, '30-40') + ') </div>');
                        $('#40-50').append("<div class='counters'> (" + getSumOfOnePrice(data.aggs.prices.buckets, '40-50') + ') </div>');
                        $('#50-60').append("<div class='counters'> (" + getSumOfOnePrice(data.aggs.prices.buckets, '50-60') + ') </div>');
                        $('#60-70').append("<div class='counters'> (" + getSumOfOnePrice(data.aggs.prices.buckets, '60-70') + ') </div>');
                        $('#70-80').append("<div class='counters'> (" + getSumOfOnePrice(data.aggs.prices.buckets, '70-80') + ') </div>');
                        $('#80-90').append("<div class='counters'> (" + getSumOfOnePrice(data.aggs.prices.buckets, '80-90') + ') </div>');
                        $('#90-100').append("<div class='counters'> (" + getSumOfOnePrice(data.aggs.prices.buckets, '90-100') + ') </div>');
                        $('#100-1000').append("<div class='counters'> (" + getSumOfOnePrice(data.aggs.prices.buckets, '100-1000') + ') </div>');

                        // formats
                        $('#noFormatFilter').append("<div class='counters'> (" + getSumOfAllItems(data.aggs.formats.buckets, 'noFormatFilter') + ') </div>');
                        $('#audiobook').append("<div class='counters'> (" + getSumOfOneFormat(data.aggs.formats.buckets, 'Audiobook') + ') </div>');
                        $('#paperback').append("<div class='counters'> (" + getSumOfOneFormat(data.aggs.formats.buckets, 'Paperback') + ') </div>');
                        $('#hardcover').append("<div class='counters'> (" + getSumOfOneFormat(data.aggs.formats.buckets, 'Hardcover') + ') </div>');

                        // authors
                        clearContent('#authorList');
                        $('#authorList')
                            .append(
                                "<label class='author' for='authors'>Authors</label>"
                            );
                        $.each(data.aggs.authors.buckets, function (index, value) {
                            $('#authorList')
                                .append(
                                    "<div class='form-check'>" +
                            "<label class='form-check-label'>" +
                            "<input class='form-check-input author' type='checkbox' name='authors' value='" + value.key + "'>" +
                            value.key + "<span class='counters'> (" + value.doc_count + ') </span>' +
                            '</label>' +
                            '</div>'
                                );
                        });

                        // clear book list area and list results
                        clearContent('#results');
                        $('#results').append(
                            "<h2 id='searchResults'>Search results</h2>" +
                            "<div id='searchedFor'>You searched for: " + searchedForFormData + '</div>'
                        );
                        // put in new book data
                        $.each(data.hits, function (index, value) {
                            appendResults(value.book, value.id, 'booksearch');
                        });

                        if ($('.resultItems').text().length === 0) {
                            $('#results').append(
                                "<div id='noResults'>Sorry, there are no results</div>"
                            );
                        }
                    });
            });
        event.preventDefault();
    });
});

// Mark title search text on click
$(document).ready(function () {
    $('#titlesearch').on('click', function () {
        this.select();
    });
});
