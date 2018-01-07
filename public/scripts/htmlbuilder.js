// CHECK IF LOGGED IN, IN CASE OF PAGE REFRESH
$(window).on('load', function(){
    $.get("/favorites")
    .done(function(data) {
        var loginName = data.name;

        if(loginName) {
            // clearContent("#header")
            $("#loginForm").hide();
            $("#loggedInAs").append("Logged in as: " + loginName);
            $("#loggedInHeader:hidden").show();
            $("#hideOnStartup-left:hidden").show();
            getMostAuthorsInitial();
        }
    });
});

// LOGIN
$(document).ready(function() {
    $("#loginForm").submit(function(event){
        var formData = {
            "username" : $("#username").val() || "",
            "password" : $("#password").val() || ""
        };

        $.post("/login", formData)
        .done(function() {

            $.get("/favorites")
            .done(function(data) {
                var loginName = data.name;

                if(loginName) {
                    // clearContent("#header")
                    $("#username").val("");
                    $("#password").val("");
                    $("#loginForm").hide();
                    $("#loggedInAs").append("Logged in as: " + loginName);
                    $("#loggedInHeader:hidden").show();
                    $("#hideOnStartup-left:hidden").show();
                    getMostAuthorsInitial();
                }
            });
        });
        event.preventDefault();
    });
});

function getMostAuthorsInitial() {
    $.get("/search")
    .done(function(data) {
        $("#authorList")
            .append(
                "<label class='authors' for='authors'>Authors</label>"
            );
        $.each(data.aggs.authors.buckets, function(index, value) {
            $("#authorList")
                .append(
                    "<div class='form-check'>" +
                    "<label class='form-check-label'>" +
                    "<input class='form-check-input author' type='checkbox' name='authors' value='" + value.key + "'>" +
                    value.key + "<span class='counters'> (" + value.doc_count + ") </span>" +
                    "</label>" +
                    "</div>"
                );
        });

    });
}

// LOGOUT
$(document).ready(function() {
    $("#header").on("click", "div #logoutButton", function() {
        clearContent("#results");
        $("#loggedInHeader").hide();
        $("#hideOnStartup-left").hide();
        $("#loginForm").show();
        $.get("/logout");
    });
});

// SHOW FAVORITES
$(document).ready(function() {
    $("#header").on("click", "div #showFavoritesButton", function() {
        clearContent("#results");
        clearContent(".counters");
        $.get("/favorites")
        .done(function(data) {
            if(data.favorites.length == 0) {
                $("#results").append("<h2>You have no favorites yet</h2>");
            } else {
                $("#results").append("<h2 id='myFavorites'>My Favorites</h2>");
                $.each(data.favorites, function(index, value) {
                    var formData = {
                        "id" : value.bookID
                    };

                    $.get("/book", formData)
                    .done(function(bookdata) {
                        $("#results")
                            .append(
                                "<div class='resultItems favoriteResults'>" +
                                "<div class='resultItem title'>" + bookdata[0]._source.title + "</div>" +
                                "<div class='resultItem publishedDate'>" + bookdata[0]._source.publishedDate + "</div>" +
                                "<div class='resultItem authors'>" + "von " + bookdata[0]._source.authors + "</div>" +
                                "<div class='resultItem categories'>" + bookdata[0]._source.categories + "</div>" +
                                "<div class='resultItem format'>" + bookdata[0]._source.format + "</div>" +
                                "<div class='resultItem price'>" + "EUR " + getDecimalNumber(bookdata[0]._source.price, 2) + "</div>" +
                                "<div class='resultItem deliveryoption'>" + "Delivery Option: " + bookdata[0]._source.deliveryoption + "</div>" +
                                "<div class='resultItem image'>" + "<img src='" + bookdata[0]._source.image + "' alt='NO IMAGE'>" + "</div>" +
                                "<div class='resultItem favorite'>" + "<div class='addOrDeletefavorite' id='" + bookdata[0]._id + "'>" + insertFavoriteImage(bookdata[0]._id) + "</div></div>" +
                                "<hr>" +
                                "</div>"
                            );
                    });
                });
            }
        });
    });
});

// ADD or REMOVE A FAVORITE
$(document).ready(function() {
    $(".wrapper").on("click", ".main #results .resultItems .favorite .addOrDeletefavorite", function() {
        var favId = this.id;
        var idTag = "#" + favId;
        var formData = {"bookID" : favId};
        var favoritesArray = [];
        var isFavorite = false;

        // Get all favorites
        $.get("/favorites")
        .done(function(data) {
            $.each(data.favorites, function(index, value) {
                favoritesArray.push(value.bookID)
            });

            // Check if given book is a favorite
            for(var i = 0; i < favoritesArray.length; i++) {
                if(favoritesArray[i] == favId) {
                    isFavorite = true;
                }
            }

            // delete or add from/to favorites
            if(isFavorite === true) {
                //TODO set pic to NO FAV
                if($(idTag).parent().parent().hasClass("favoriteResults")) {
                    $(idTag).parent().parent().empty();
                } else {
                    clearContent(idTag);
                    $(idTag).append("<img class='star' src='./images/star_empty.png' alt='fav'>");
                }
                $.ajax({
                    type: "DELETE",
                    url: "/favorites",
                    data: formData
                });
            } else {
                //TODO set pic to  FAV
                clearContent(idTag);
                $(idTag).append("<img class='star' src='./images/star_yellow.png' alt='fav'>");
                $.ajax({
                    type: "POST",
                    url: "/favorites",
                    data: formData
                });
            }
        });
    });
});


function insertFavoriteImage(id) {
    var idTag = "#" + id;
    var formData = {"bookID" : id};
    var favoritesArray = [];
    var isFavorite = false;

    // Get all favorites
    $.get("/favorites")
    .done(function(data) {
        $.each(data.favorites, function(index, value) {
            favoritesArray.push(value.bookID)
        });

        // Check if given book is a favorite
        for(var i = 0; i < favoritesArray.length; i++) {
            if(favoritesArray[i] == id) {
                isFavorite = true;
            }
        }

        // insert right favorite image
        clearContent(idTag);
        if(isFavorite === true) {
            $(idTag).append("<img class='star' src='./images/star_yellow.png' alt='fav'>");
        } else {
            $(idTag).append("<img class='star' src='./images/star_empty.png' alt='fav'>");
        }
    });
}

function searchedFor(formData) {
    let searchedFor = "";

    if(formData.title) {
        if(searchedFor === "") {
            searchedFor = searchedFor.concat(formData.title);
        } else {
            searchedFor = searchedFor.concat(", ", formData.title);
        }
    }

    if(formData.price_min) {
        if(searchedFor === "") {
            searchedFor = searchedFor.concat(formData.price_min, " to ", formData.price_max, "€");
        } else {
            searchedFor = searchedFor.concat(", ", formData.price_min, " to ", formData.price_max, "€");
        }
    }

    if(formData.published_date) {
        if(searchedFor === "") {
            searchedFor = searchedFor.concat(formData.published_date);
        } else {
            searchedFor = searchedFor.concat(", ", formData.published_date);
        }
    }

    if(formData.format) {
        if(searchedFor === "") {
            searchedFor = searchedFor.concat(formData.format);
        } else {
            searchedFor = searchedFor.concat(", ", formData.format);
        }
    }

    if(formData.delivery_option) {
        if(searchedFor === "") {
            searchedFor = searchedFor.concat(formData.delivery_option);
        } else {
            searchedFor = searchedFor.concat(", ", formData.delivery_option);
        }
    }

    if(formData.categories) {
        if(searchedFor === "") {
            searchedFor = searchedFor.concat(formData.categories);
        } else {
            searchedFor = searchedFor.concat(", ", formData.categories);
        }
    }

    if(formData.authors) {
        if(searchedFor === "") {
            searchedFor = searchedFor.concat(formData.authors);
        } else {
            searchedFor = searchedFor.concat(", ", formData.authors);
        }
    }

    return searchedFor;
}

// Trigger book search after x characters at the title search
$(document).ready(function() {
    $('#titlesearch').on("keyup", function() {
        if( this.value.length > 2 ) {
            $('#searchForm').submit();
        }
    });
});

// Trigger book search after changing price category
$(document).ready(function() {
    $('#pricecategory').on("change", function() {
        $('#searchForm').submit();
    });
});

// Trigger book search after changing delivery option
$(document).ready(function() {
    $('#deliveryoption').on("change", function() {
        $('#searchForm').submit();
    });
});

// Trigger book search after changing format
$(document).ready(function() {
    $('#format').on("change", function() {
        $('#searchForm').submit();
    });
});

// Trigger book search after changing category or author
$(document).ready(function() {
    $(".wrapper").on("change", ".search #searchForm .form-group .form-check .form-check-label .form-check-input", function() {
        $('#searchForm').submit();
    });
});

// Search books
$(document).ready(function() {
    // Submit search data
    $("#searchForm").submit(function(event){
        var formData = {
            "title" : $("#titlesearch").val(),
            "price_min" : getMinOrMaxPriceOutOfString($("#pricecategory").val(),0) || "",
            "price_max" : getMinOrMaxPriceOutOfString($("#pricecategory").val(),1) || "",
            "published_date" : $("#publishedDate").val(),
            "format" : $("#format").val(),
            "delivery_option" : $("#deliveryoption").val(),
            "categories" : getCommaSeparatedList("categories"),
            "authors" : getCommaSeparatedList("authors")
        };


        var searchedForFormData = searchedFor(formData);

        // Get array of favorites to compare if book is favorite
        var favoritesArray = [];

        $.get("/favorites")
        .done(function(data) {
            $.each(data.favorites, function(index, value) {
                favoritesArray.push(value.bookID)
            });

            // Get requested books
            $.get("/search", formData)
            .done(function(data) {

                // update filters to fit search results
                clearContent(".counters");
                // prices
                $("#noPricecategoryOption").append("<div class='counters'> (" + getSumOfAllItems(data.aggs.prices.buckets, "noPricecategoryOption") + ") </div>");
                $("#0-10").append("<div class='counters'> (" + getSumOfOnePrice(data.aggs.prices.buckets, "0-10") + ") </div>");
                $("#10-20").append("<div class='counters'> (" + getSumOfOnePrice(data.aggs.prices.buckets, "10-20") + ") </div>");
                $("#20-30").append("<div class='counters'> (" + getSumOfOnePrice(data.aggs.prices.buckets, "20-30") + ") </div>");
                $("#30-40").append("<div class='counters'> (" + getSumOfOnePrice(data.aggs.prices.buckets, "30-40") + ") </div>");
                $("#40-50").append("<div class='counters'> (" + getSumOfOnePrice(data.aggs.prices.buckets, "40-50") + ") </div>");
                $("#50-60").append("<div class='counters'> (" + getSumOfOnePrice(data.aggs.prices.buckets, "50-60") + ") </div>");
                $("#60-70").append("<div class='counters'> (" + getSumOfOnePrice(data.aggs.prices.buckets, "60-70") + ") </div>");
                $("#70-80").append("<div class='counters'> (" + getSumOfOnePrice(data.aggs.prices.buckets, "70-80") + ") </div>");
                $("#80-90").append("<div class='counters'> (" + getSumOfOnePrice(data.aggs.prices.buckets, "80-90") + ") </div>");
                $("#90-100").append("<div class='counters'> (" + getSumOfOnePrice(data.aggs.prices.buckets, "90-100") + ") </div>");
                $("#100-1000").append("<div class='counters'> (" + getSumOfOnePrice(data.aggs.prices.buckets, "100-1000") + ") </div>");

                // formats
                $("#noFormatFilter").append("<div class='counters'> (" + getSumOfAllItems(data.aggs.formats.buckets, "noFormatFilter") + ") </div>");
                $("#audiobook").append("<div class='counters'> (" + getSumOfOneFormat(data.aggs.formats.buckets, "Audiobook") + ") </div>");
                $("#paperback").append("<div class='counters'> (" + getSumOfOneFormat(data.aggs.formats.buckets, "Paperback") + ") </div>");
                $("#hardcover").append("<div class='counters'> (" + getSumOfOneFormat(data.aggs.formats.buckets, "Hardcover") + ") </div>");

                // authors
                clearContent("#authorList");
                    $("#authorList")
                        .append(
                            "<label class='authors' for='authors'>Authors</label>"
                        );
                    $.each(data.aggs.authors.buckets, function(index, value) {
                        $("#authorList")
                            .append(
                                "<div class='form-check'>" +
                                "<label class='form-check-label'>" +
                                "<input class='form-check-input author' type='checkbox' name='authors' value='" + value.key + "'>" +
                                value.key + "<span class='counters'> (" + value.doc_count + ") </span>" +
                                "</label>" +
                                "</div>"
                            );
                    });

                // clear book list area and list results
                clearContent("#results");
                $("#results").append(
                    "<h2 id='searchResults'>Search results</h2>" +
                    "<div id='searchedFor'>You searched for: " + searchedForFormData + "</div>"
                );
                $.each(data.hits, function(index, value) {
                    var isFav = false;

                    for(var i = 0; i < favoritesArray.length; i++) {
                        if(favoritesArray[i] ==  value.id) {
                            isFav = true;
                        }
                    }

                    $("#results")
                        .append(
                            "<div class='resultItems'>" +
                            "<div class='resultItem title'>" + value.book.title + "</div>" +
                            "<div class='resultItem publishedDate'>" + value.book.publishedDate + "</div>" +
                            "<div class='resultItem authors'>" + "von " + value.book.authors + "</div>" +
                            "<div class='resultItem categories'>" + value.book.categories + "</div>" +
                            "<div class='resultItem format'>" + value.book.format + "</div>" +
                            "<div class='resultItem price'>" + "EUR " + getDecimalNumber(value.book.price, 2) + "</div>" +
                            "<div class='resultItem deliveryoption'>" + "Delivery Option: " + value.book.deliveryoption + "</div>" +
                            "<div class='resultItem image'>" + "<img src='" + value.book.image + "' alt='NO IMAGE'>" + "</div>" +
                            "<div class='resultItem favorite'>" + "<div class='addOrDeletefavorite' id='" + value.id + "'>" + insertFavoriteImage(value.id) + "</div></div>" +
                            "<hr>" +
                            "</div>"
                        );
                });
                if ( $(".resultItems").text().length === 0 ) {
                    $("#results").append(
                        "<div id='noResults'>Sorry, there are no results</div>"
                    );
                }
            });


        });
        event.preventDefault();
    });
});


function getSumOfAllItems(data) {
    let sum = 0;

    data.forEach(date => {
        sum += date.doc_count;
    });

    return sum;
}

function getSumOfOnePrice(data, item) {
    let sum = 0;
    let minAndMaxPrice = extractPricesFromString(item);

    data.forEach(date => {
        let key = parseInt(date.key);

        if(key >= minAndMaxPrice[0] && key < minAndMaxPrice[1]) {
            sum += date.doc_count;
        }
    });

    return sum;
}

function getSumOfOneFormat(data, item) {
    let sum = 0;

    data.forEach(date => {
        if(item === date.key) {
            sum += date.doc_count;
        }
    });

    return sum;
}

// get the min and max price out of option string
function extractPricesFromString(optionString) {

    var m = /(\d+)-(\d+)/.exec(optionString);

    return m ? [+m[1], +m[2]] : null;
}

function clearContent(tag) {
    $(tag).empty();
}

//minOrMax 0=min 1=max
function getMinOrMaxPriceOutOfString(priceMinAndMaxString, minOrMax) {
    return priceMinAndMaxString.split('-')[minOrMax];
}

function getCommaSeparatedList(inputName) {
    var arrayOfItems = [];
    var commaSeparatedList = "";
    var comma = ",";

    $.each($("input[name=" + inputName + "]:checked"), function() {
        arrayOfItems.push($(this).val());
    });

    if(arrayOfItems.length >= 1) {
        arrayOfItems.forEach(item => {
            if (commaSeparatedList === "") {
                commaSeparatedList = item;
            } else {
                commaSeparatedList = commaSeparatedList.concat(comma, item);
            }
        })
    }

    return commaSeparatedList;
}

function getDecimalNumber(value, decimal) {
    return value.toFixed(decimal);
}

// mark title search text on click
$(document).ready(function() {
    $("#titlesearch").on("click", function() {
        $(this).select();
    })
});
